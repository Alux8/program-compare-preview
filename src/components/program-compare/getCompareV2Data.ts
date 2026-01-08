import { fetchAllPrograms } from "../../../lib/compare-v2/fetchSovokupnost";



type ApiProgramItem = any;

export type ProgramRow = {
  program_id: string;
  program_title: string;
  program_link?: string;
};

export type ParamRow = {
  param_key: string;
  param_title: string;
  subgroup?: string;
};

export type ValueRow = {
  program_id: string;
  param_key: string;
  value: any;
};

function safeStr(v: any) {
  return String(v ?? "").trim();
}

function valOrDash(v: any) {
  const s = safeStr(v);
  return s.length ? s : "—";
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

export async function getCompareV2Data() {
  // Вся загрузка (бак + спец + все страницы) — внутри fetchSovokupnostAll
  const raw = await fetchAllPrograms();

  // Дедуп по Program.Code
  const items = dedupeByProgramCode(raw);

  // programs
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

  // params (V2-params, как у тебя сейчас)
  const params: ParamRow[] = [
    { param_key: "level", param_title: "Уровень", subgroup: "О программе" },
    { param_key: "napr", param_title: "Направление", subgroup: "О программе" },
    { param_key: "oprog", param_title: "О программе", subgroup: "О программе" },
    { param_key: "institute", param_title: "Институт", subgroup: "О программе" },
    { param_key: "form", param_title: "Форма обучения", subgroup: "О программе" },
    {
      param_key: "army_deferral",
      param_title: "Отсрочка от армии",
      subgroup: "О программе",
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

  // values
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

    // короткое описание (с фолбэком на длинное)
    const shortDesc = safeStr(p?.ShortDescription);
    push("oprog", valOrDash(shortDesc || p?.OProgramme));
  }

  return { programs, params, values };
}
