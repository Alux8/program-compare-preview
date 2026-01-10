"use client";

import React, { useMemo, useState } from "react";

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

type Props = {
  leftProgram: ProgramRow;
  rightProgram: ProgramRow;
  params: ParamRow[];
  valuesMap: Map<string, any>;
};

type Row =
  | { kind: "subgroup"; title: string; key: string }
  | {
      kind: "param";
      key: string;
      p: ParamRow;
      left: any;
      right: any;
      subgroup: string | null;
    };

function normalizeLink(link?: string) {
  if (!link) return null;
  if (link.startsWith("http")) return link;
  return `https://www.ranepa.ru${link}`;
}

export default function MobileCompareListV2({
  leftProgram,
  rightProgram,
  params,
  valuesMap,
}: Props) {
  // список подгрупп в порядке появления
  const subgroupsOrdered = useMemo(() => {
    const out: string[] = [];
    let current: string | null = null;

    for (const p of params) {
      const sg = (p.subgroup ?? "").trim();
      if (sg && sg !== current) {
        current = sg;
        out.push(sg);
      }
    }
    return out;
  }, [params]);

  // Mobile: по умолчанию открыта только первая подгруппа
  const [openSubgroups, setOpenSubgroups] = useState<Set<string>>(() => {
    const first = subgroupsOrdered[0];
    return first ? new Set([first]) : new Set();
  });

  const toggleSubgroup = (sg: string) => {
    setOpenSubgroups((prev) => {
      const next = new Set(prev);
      if (next.has(sg)) next.delete(sg);
      else next.add(sg);
      return next;
    });
  };

  const rows = useMemo(() => {
    const get = (programId: string, key: string) =>
      valuesMap.get(`${programId}__${key}`) ?? "—";

    const out: Row[] = [];
    let currentSubgroup: string | null = null;

    for (const p of params) {
      const sg = (p.subgroup ?? "").trim();
      if (sg && sg !== currentSubgroup) {
        currentSubgroup = sg;
        out.push({ kind: "subgroup", title: sg, key: `sg:${sg}` });
      }

      out.push({
        kind: "param",
        key: p.param_key,
        p,
        left: get(leftProgram.program_id, p.param_key),
        right: get(rightProgram.program_id, p.param_key),
        subgroup: currentSubgroup,
      });
    }

    return out;
  }, [leftProgram.program_id, rightProgram.program_id, params, valuesMap]);

  const leftHref = normalizeLink(leftProgram.program_link);
  const rightHref = normalizeLink(rightProgram.program_link);

  return (
    <section className="pcMobile" style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Сравнение</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ fontWeight: 600 }}>{leftProgram.program_title}</div>
        <div style={{ fontWeight: 600 }}>{rightProgram.program_title}</div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((row) => {
          if (row.kind === "subgroup") {
            const isOpen = openSubgroups.has(row.title);

            return (
              <button
  key={row.key}
  type="button"
  className={`pcMobile__subgroup pcMobile__subgroupBtn pcV2__accordionRow ${
    isOpen ? "pcV2__accordionRow--open" : ""
  }`}
  onClick={() => toggleSubgroup(row.title)}
  aria-expanded={isOpen}
>
  <span className="pcV2__accordionArrow" aria-hidden="true" />
  <span className="pcV2__accordionTitle">{row.title}</span>
</button>

            );
          }

          // если подгруппа закрыта — карточку не показываем
          if (row.subgroup && !openSubgroups.has(row.subgroup)) return null;

          return (
            <div
              key={row.key}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {row.p.param_title}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    {leftProgram.program_title}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {String(row.left)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    {rightProgram.program_title}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {String(row.right)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Actions (buttons) ===== */}
      {(leftHref || rightHref) && (
        <div className="pcMobile__actions">
          {leftHref && (
            <a
              href={leftHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pcV2__btn pcV2__btn--mobile"
            >
              Подробнее о программе 1
            </a>
          )}

          {rightHref && (
            <a
              href={rightHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pcV2__btn pcV2__btn--mobile"
            >
              Подробнее о программе 2
            </a>
          )}
        </div>
      )}
    </section>
  );
}
