"use client";
import DesktopCompareTable from "./DesktopCompareTable";
import MobileCompareList from "./MobileCompareList";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import programs from "../../data/compare/programs.json";
import params from "../../data/compare/params.json";
import values from "../../data/compare/values.json";

import ProgramSearchSelect from "./ProgramSearchSelect";

type ProgramRow = {
  program_id: string;
  program_title: string;
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

export default function ProgramCompare() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const safeLeftId = String(searchParams.get("left") ?? "010266");
  const safeRightId = String(searchParams.get("right") ?? "010621");

  const left = (programs as ProgramRow[]).find(
    (p) => String(p.program_id) === safeLeftId
  );
  const right = (programs as ProgramRow[]).find(
    (p) => String(p.program_id) === safeRightId
  );

  // valuesMap[programId][param_key] = value
  const valuesMap: Record<string, Record<string, any>> = {};
  (values as ValueRow[]).forEach((row) => {
    const pid = String(row.program_id);
    if (!valuesMap[pid]) valuesMap[pid] = {};
    valuesMap[pid][row.param_key] = row.value;
  });

 // 1 уровень: subgroup -> params[]
const groupedParams = (params as ParamRow[]).reduce<
  Record<string, ParamRow[]>
>((acc, param) => {
  const subgroup = param.subgroup || "Без группы";

  if (!acc[subgroup]) acc[subgroup] = [];
  acc[subgroup].push(param);

  return acc;
}, {});


  
  const [collapsedSubGroups, setCollapsedSubGroups] = useState<
    Record<string, boolean>
  >({});

const [showDiffOnly, setShowDiffOnly] = useState(false);

  const toggleSubGroup = (key: string) => {
    setCollapsedSubGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const normalizeId = (id: unknown) =>
    String(id ?? "").replace(/^0+(?=\d)/, "");
  const pad6 = (id: unknown) => normalizeId(id).padStart(6, "0");

  const leftValues =
    valuesMap[normalizeId(safeLeftId)] || valuesMap[pad6(safeLeftId)] || {};
  const rightValues =
    valuesMap[normalizeId(safeRightId)] || valuesMap[pad6(safeRightId)] || {};

    function normalizeForCompare(value: any) {
  if (value === null || value === undefined) return "";

  // приводим всё к строке
  let raw = String(value).replace(/\s+/g, " ").trim();

  // считаем прочерки и пустые "нет данных" одинаковым пустым значением
  const lowered = raw.toLowerCase();
  if (
    raw === "—" ||
    raw === "-" ||
    raw === "–" ||
    lowered === "нет" ||
    lowered === "нет данных" ||
    lowered === "n/a"
  ) {
    return "";
  }

  // boolean
  if (typeof value === "boolean") return value ? "1" : "0";

  // числа и "числа строкой" (с пробелами/запятыми)
  const numCandidate = raw
    .replace(/\s/g, "")
    .replace(/[^\d,.\-]/g, "")
    .replace(",", ".");
  const num = Number(numCandidate);

  // важно: не превращаем любой текст в 0, только если реально есть цифры
  if (!Number.isNaN(num) && /[\d]/.test(raw)) return String(num);

  // текст: сравниваем без регистра
  return lowered;
}

function isDifferent(leftVal: any, rightVal: any) {
  return normalizeForCompare(leftVal) !== normalizeForCompare(rightVal);
}

  function formatValue(value: any, _paramKey?: string, paramTitle?: string) {
    
    if (value === null || value === undefined || value === "") return "—";

    const title = (paramTitle || "").toLowerCase();

    // Цена
    if (
      title.includes("стоим") ||
      title.includes("цена") ||
      title.includes("руб")
    ) {
      const num = Number(
        String(value)
          .replace(/[^\d,.\s]/g, "")
          .replace(/\s/g, "")
          .replace(",", ".")
      );
      if (!Number.isNaN(num)) {
        return `${new Intl.NumberFormat("ru-RU").format(num)} ₽`;
      }
    }

    // Отсрочка от армии
    if (title.includes("отсроч") && title.includes("арм")) {
      const v = String(value).toLowerCase();
      if (["1", "да", "есть", "true"].includes(v)) {
        return <span className="pc__badge pc__badge--yes">есть</span>;
      }
      if (["0", "нет", "false"].includes(v)) {
        return <span className="pc__badge pc__badge--no">нет</span>;
      }
      return "—";
    }

    return String(value);
  }
  const leftProgramTitle = left?.program_title ?? "Программа 1";
const rightProgramTitle = right?.program_title ?? "Программа 2";
const subGroups = Object.keys(groupedParams);

  return (
    <section className="border rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgramSearchSelect
          label="Программа 1"
          programs={programs as any[]}
          valueId={safeLeftId}
          onChange={(nextId) => {
            const sp = new URLSearchParams(searchParams.toString());
            sp.set("left", String(nextId));
            sp.set("right", String(safeRightId));
            router.push(`/compare?${sp.toString()}`);
          }}
        />

        <ProgramSearchSelect
          label="Программа 2"
          programs={programs as any[]}
          valueId={safeRightId}
          onChange={(nextId) => {
            const sp = new URLSearchParams(searchParams.toString());
            sp.set("left", String(safeLeftId));
            sp.set("right", String(nextId));
            router.push(`/compare?${sp.toString()}`);
          }}
        />
      </div>
      <div className="flex items-center gap-3 text-sm">
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={showDiffOnly}
      onChange={(e) => setShowDiffOnly(e.target.checked)}
    />
    <span title="Скрывает параметры, значения которых совпадают">Показать только различия</span>
  </label>
</div>
<div className="pc__desktop">
      <div className="pc__tableWrap">
        <DesktopCompareTable>
        <table className="pc__table">
          <thead>
            <tr>
              <th>Параметр</th>
              <th>{left?.program_title ?? "Программа 1"}</th>
              <th>{right?.program_title ?? "Программа 2"}</th>
            </tr>
          </thead>

         <tbody>
  {Object.entries(groupedParams).map(([subgroup, groupParams]) => {
    const isCollapsed = !!collapsedSubGroups[subgroup];
    const hasDiffInSubGroup = groupParams.some((p) =>
    isDifferent(leftValues[p.param_key], rightValues[p.param_key])
  );
    if (showDiffOnly && !hasDiffInSubGroup) return null;
    return (
      <React.Fragment key={subgroup}>
        {/* строка ПОДКАТЕГОРИИ */}
        <tr
          className="pc__subGroupRow"
          onClick={() => toggleSubGroup(subgroup)}
          style={{ cursor: "pointer" }}
        >
          <td colSpan={3}>
            {isCollapsed ? "▶ " : "▼ "}
            {subgroup}
          </td>
        </tr>

        {/* параметры */}
{!isCollapsed &&
  groupParams
    .filter(
      (p) =>
        !showDiffOnly ||
        isDifferent(leftValues[p.param_key], rightValues[p.param_key])
    )
    .map((p) => (
      <tr key={p.param_key}>
        <td>{p.param_title}</td>

        <td>
          {formatValue(
            leftValues[p.param_key],
            p.param_key,
            p.param_title
          )}
        </td>

        <td>
          {formatValue(
            rightValues[p.param_key],
            p.param_key,
            p.param_title
          )}
        </td>
      </tr>
    ))}

      </React.Fragment>
    );
  })}

  {/* кнопки */}
  <tr className="pc__actionsRow">
    <td />
    <td>
      <a
        href={`https://www.ranepa.ru/bakalavriat/napravleniya-i-programmy/${safeLeftId}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="pc__btn"
      >
        Подробнее о программе 1
      </a>
    </td>
    <td>
      <a
        href={`https://www.ranepa.ru/bakalavriat/napravleniya-i-programmy/${safeRightId}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="pc__btn"
      >
        Подробнее о программе 2
      </a>
    </td>
  </tr>
</tbody>

        </table>
        </DesktopCompareTable>
      </div>
      </div>
     <div className="pc__mobile">
  <MobileCompareList
    leftProgramTitle={left?.program_title ?? "Программа 1"}
    rightProgramTitle={right?.program_title ?? "Программа 2"}
    groupedParams={groupedParams}
    leftValues={leftValues}
    rightValues={rightValues}
    formatValue={formatValue}
    safeLeftId={safeLeftId}
    safeRightId={safeRightId}
    showDiffOnly={showDiffOnly}
  />
</div>
    </section>
  );
}
