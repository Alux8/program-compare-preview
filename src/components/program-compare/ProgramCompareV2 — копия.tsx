import React from "react";
import ProgramCompareV2Client from "./ProgramCompareV2Client";

type ApiProgramItem = any;

type ProgramRow = {
  program_id: string;
  program_title: string;
  program_link?: string;
};

type ParamRow = {
  param_key: string;
  param_title: string;
  group?: string;
  subgroup?: string;
};

type ValueRow = {
  program_id: string;
  param_key: string;
  value: any;
};

type Props = {};

function safeStr(v: any) {
  return String(v ?? "").trim();
}

function valOrDash(v: any) {
  const s = safeStr(v);
  return s.length ? s : "—";
}

function toInt(v: any, fallback = 1) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const REVALIDATE_SECONDS = 60 * 60 * 12; // 12 часов = 2 раза в сутки

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.json();
}


function buildUrl(level: "bakalavriat" | "specialitet", page: number) {
  return `https://www.ranepa.ru/sync/getSovokupnost3.php?level=${level}&page=${page}`;
}

function normalizeItems(json: any): ApiProgramItem[] {
  const arr = json?.PROGRAMS;
  return Array.isArray(arr) ? arr : [];
}

function getCountPages(json: any) {
  return toInt(
    json?.countPages ??
      json?.CountPages ??
      json?.count_pages ??
      json?.COUNT_PAGES ??
      1,
    1
  );
}

async function fetchLevelAllPages(level: "bakalavriat" | "specialitet") {
  const first = await fetchJson(buildUrl(level, 1));
  const countPages = getCountPages(first);

  const all: ApiProgramItem[] = [...normalizeItems(first)];

  for (let page = 2; page <= countPages; page++) {
    const json = await fetchJson(buildUrl(level, page));
    all.push(...normalizeItems(json));
  }

  return all;
}

async function fetchAllPrograms() {
  const [baka, spec] = await Promise.all([
    fetchLevelAllPages("bakalavriat"),
    fetchLevelAllPages("specialitet"),
  ]);

  return [...baka, ...spec];
}

function dedupeByProgramCode(items: ApiProgramItem[]) {
  const m = new Map<string, ApiProgramItem>();
  for (const it of items) {
    const code = safeStr(it?.Program?.Code);
    if (!code) continue;
    if (!m.has(code)) m.set(code, it);
  }
  return Array.from(m.values());
}

function buildCompareData(items: ApiProgramItem[]) {
  const programs: ProgramRow[] = items
    .map((it) => {
      const code = safeStr(it?.Program?.Code);
      if (!code) return null;

      const title = safeStr(it?.Program?.Title || it?.Program?.Name || code);
      const link = safeStr(it?.Program?.Link);

      return {
        program_id: code,
        program_title: `${code} — ${title}`,
        program_link: link || undefined,
      };
    })
    .filter(Boolean) as ProgramRow[];

  const params: ParamRow[] = [
    { param_key: "level", param_title: "Уровень", subgroup: "О программе" },
    { param_key: "napr", param_title: "Направление", subgroup: "О программе" },
    { param_key: "oprog", param_title: "О программе", subgroup: "О программе" },
    { param_key: "institute", param_title: "Институт", subgroup: "О программе" },
    { param_key: "form", param_title: "Форма обучения", subgroup: "О программе" },
    { param_key: "army_deferral", param_title: "Отсрочка от армии", subgroup: "О программе",
    },

    

    { param_key: "format", param_title: "Формат обучения", subgroup: "О программе" },

    { param_key: "year", param_title: "Год", subgroup: "Стоимость и места" },
    { param_key: "price", param_title: "Стоимость", subgroup: "Стоимость и места" },
    { param_key: "dogovor", param_title: "Места (договор)", subgroup: "Стоимость и места" },
    { param_key: "budget", param_title: "Места (бюджет)", subgroup: "Стоимость и места" },

    {
      param_key: "score_prev_budget",
      param_title: "Проходной балл (бюджет, прошлый год)",
      subgroup: "Поступление и конкурс",
    },
    {
      param_key: "score_prev_dogovor",
      param_title: "Проходной балл (договор, прошлый год)",
      subgroup: "Поступление и конкурс",
    },

    { param_key: "subjects", param_title: "Предметы ЕГЭ", subgroup: "Поступление и конкурс" },
  ];

  const values: ValueRow[] = [];

  for (const it of items) {
    const code = safeStr(it?.Program?.Code);
    if (!code) continue;

    const p = it?.Program ?? {};
  

    const s = it?.Sovokupnost ?? {};

    const push = (param_key: string, value: any) => {
      values.push({ program_id: code, param_key, value });
    };

    push("level", valOrDash(p?.Level));
    push("napr", valOrDash(p?.Napr));
    push("institute", valOrDash(p?.Institute));
    push("form", valOrDash(p?.Form));

    const formRaw = safeStr(p?.Form).toLowerCase();
    const hasArmyDeferral =
      formRaw.includes("очная") && !formRaw.includes("очно-заочная");

    push("army_deferral", hasArmyDeferral ? "есть" : "нет");

    push("format", valOrDash(p?.Format));

    push("year", valOrDash(s?.Year));
    push("price", valOrDash(s?.Price));
    push("dogovor", valOrDash(s?.Mesta_Dogovor));
    push("budget", valOrDash(s?.Mesta_Budget));

    push("score_prev_budget", valOrDash(s?.ScorePrevious_Budget));
    push("score_prev_dogovor", valOrDash(s?.ScorePrevious_Dogovor));

    const subjects =
      Array.isArray(s?.Ar_Predmet) && s.Ar_Predmet.length
        ? s.Ar_Predmet.join(", ")
        : Array.isArray(s?.arPredmetFull)
        ? s.arPredmetFull
            .map((x: any) => x?.Name_Site || x?.Full_Name)
            .filter(Boolean)
            .join(", ")
        : "—";

    push("subjects", subjects);

    const shortDesc = safeStr(p?.ShortDescription);
push("oprog", valOrDash(shortDesc || p?.OProgramme));

  }

  return { programs, params, values };
}

export default async function ProgramCompareV2(_props: Props) {
  const raw = await fetchAllPrograms();
  const merged = dedupeByProgramCode(raw);

  const { programs, params, values } = buildCompareData(merged);

  return (
    <ProgramCompareV2Client
      programs={programs}
      params={params}
      values={values}
    />
  );
}
