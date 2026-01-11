import React, { useState } from "react";

type ProgramRow = {
  program_id: string;
  program_title: string;
  program_link?: string;
};

type ParamRow = {
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

export default function DesktopCompareTableV2({
  leftProgram,
  rightProgram,
  params,
  valuesMap,
}: Props) {
  const getValue = (programId: string, key: string) =>
    valuesMap.get(`${programId}__${key}`) ?? "—";

  const normalizeLink = (link?: string) => {
    if (!link) return null;
    if (link.startsWith("http")) return link;
    return `https://www.ranepa.ru${link}`;
  };

  const leftHref = normalizeLink(leftProgram.program_link);
  const rightHref = normalizeLink(rightProgram.program_link);

  const stripProgramCode = (title: string) => {
    // Убираем префикс вида "000000 — " в начале
    return title.replace(/^\d+\s*—\s*/, "").trim();
  };

  // Desktop: по умолчанию все подгруппы открыты -> храним только закрытые
  const [closedSubgroups, setClosedSubgroups] = useState<Set<string>>(
    () => new Set()
  );

  const toggleSubgroup = (sg: string) => {
    setClosedSubgroups((prev) => {
      const next = new Set(prev);
      if (next.has(sg)) next.delete(sg);
      else next.add(sg);
      return next;
    });
  };

  let currentSubgroup: string | null = null;

  return (
    <div className="pcTable">
      {/* ===== Header ===== */}
      <div className="pcTable__head">
        <div className="pcTable__col pcTable__col--param" />
        <div className="pcTable__col pcTable__col--left">
          {stripProgramCode(leftProgram.program_title)}
        </div>
        <div className="pcTable__col pcTable__col--right">
          {stripProgramCode(rightProgram.program_title)}
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="pcTable__body">
        {params.flatMap((p) => {
          const rows: React.ReactNode[] = [];

          const sg = (p.subgroup ?? "").trim();

          // заголовок подгруппы (кликабельный)
          if (sg && sg !== currentSubgroup) {
            currentSubgroup = sg;
            const isClosed = closedSubgroups.has(sg);

            rows.push(
              <button
                key={`sg:${sg}`}
                type="button"
                className={`pcTable__subgroup pcTable__subgroupBtn pcV2__accordionRow ${
                  isClosed ? "" : "pcV2__accordionRow--open"
                }`}
                onClick={() => toggleSubgroup(sg)}
                aria-expanded={!isClosed}
              >
                <span className="pcV2__accordionArrow" aria-hidden="true" />
                <span className="pcV2__accordionTitle">{sg}</span>
              </button>
            );
          }

          // если текущая подгруппа закрыта — строки внутри неё не рендерим
          if (currentSubgroup && closedSubgroups.has(currentSubgroup)) {
            return rows;
          }

          rows.push(
            <div className="pcTable__row" key={p.param_key}>
              <div className="pcTable__cell pcTable__cell--param">
                {p.param_title}
              </div>
              <div className="pcTable__cell">
                {String(getValue(leftProgram.program_id, p.param_key))}
              </div>
              <div className="pcTable__cell">
                {String(getValue(rightProgram.program_id, p.param_key))}
              </div>
            </div>
          );

          return rows;
        })}

        {/* ===== Actions row (buttons) ===== */}
        <div className="pcTable__row pcTable__actionsRow">
          <div className="pcTable__cell pcTable__cell--param" />

          <div className="pcTable__cell pcTable__cell--action">
            {leftHref && (
              <a
                href={leftHref}
                target="_blank"
                rel="noopener noreferrer"
                className="pcV2__btn"
              >
                Подробнее о программе 1
              </a>
            )}
          </div>

          <div className="pcTable__cell pcTable__cell--action">
            {rightHref && (
              <a
                href={rightHref}
                target="_blank"
                rel="noopener noreferrer"
                className="pcV2__btn"
              >
                Подробнее о программе 2
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
