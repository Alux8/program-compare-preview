"use client";

import React, { useMemo, useState } from "react";

import CompareSelectorsV2 from "./CompareSelectorsV2";
import DesktopCompareTableV2 from "./DesktopCompareTableV2";
import MobileCompareListV2 from "./MobileCompareListV2";

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

type Props = {
  programs: ProgramRow[];
  params: ParamRow[];
  values: ValueRow[];
};

function normalizeValue(v: any) {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  if (s === "—") return "";
  return s;
}

export default function ProgramCompareV2Client({
  programs,
  params,
  values,
}: Props) {
  // стартуем пусто: пользователь сам выбирает 2 программы
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);

  const leftProgram = useMemo(
    () => programs.find((p) => p.program_id === leftId) ?? null,
    [programs, leftId]
  );

  const rightProgram = useMemo(
    () => programs.find((p) => p.program_id === rightId) ?? null,
    [programs, rightId]
  );

  // values -> map: `${program_id}__${param_key}` -> value
  const valuesMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const row of values) {
      m.set(`${row.program_id}__${row.param_key}`, row.value);
    }
    return m;
  }, [values]);

  // готово, только если выбраны обе программы
  const isReady = Boolean(leftProgram && rightProgram);

  // фильтрация параметров: оставить только различия
  const filteredParams = useMemo(() => {
    if (!showOnlyDiffs || !leftProgram || !rightProgram) return params;

    return params.filter((p) => {
      const leftVal = normalizeValue(
        valuesMap.get(`${leftProgram.program_id}__${p.param_key}`)
      );
      const rightVal = normalizeValue(
        valuesMap.get(`${rightProgram.program_id}__${p.param_key}`)
      );

      return leftVal !== rightVal;
    });
  }, [showOnlyDiffs, params, valuesMap, leftProgram, rightProgram]);

  return (
    <main className="pcV2">
      <section className="pcV2">
        <section className="pcUI__selectors">
          <CompareSelectorsV2
            programs={programs}
            leftProgram={leftProgram}
            rightProgram={rightProgram}
            setLeftProgramId={setLeftId}
            setRightProgramId={setRightId}
          />
        </section>
      </section>


      {/* checkbox можно показывать всегда, но disabled до выбора */}
      <label
        className="pcUI__diffToggle pcV2__checkbox"
        style={!isReady ? { opacity: 0.6, pointerEvents: "none" } : undefined}
      >
        <input
          type="checkbox"
          checked={showOnlyDiffs}
          onChange={(e) => setShowOnlyDiffs(e.target.checked)}
          disabled={!isReady}
        />
        <span title="Скрывает параметры, значения которых совпадают">
          Оставить только различия
        </span>
      </label>

      {!isReady ? (
        <div className="pc__empty">
          <div className="pc__emptyTitle">Выберите две программы для сравнения</div>
          <div className="pc__emptyHint">
            Начните вводить код или название программы в поля выше
          </div>
        </div>
      ) : (
        <>
          <div className="pcV2__desktop">
            <DesktopCompareTableV2
              leftProgram={leftProgram!}
              rightProgram={rightProgram!}
              params={filteredParams}
              valuesMap={valuesMap}
            />
          </div>

          <div className="pcV2__mobile">
            <MobileCompareListV2
              leftProgram={leftProgram!}
              rightProgram={rightProgram!}
              params={filteredParams}
              valuesMap={valuesMap}
            />
          </div>
        </>
      )}

    </main>
  );
}
