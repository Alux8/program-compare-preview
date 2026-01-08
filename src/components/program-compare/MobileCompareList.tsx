"use client";
import React, { useMemo, useState } from "react";
const PINNED_GROUP = "О программе";
type ParamRow = {
  param_key: string;
  param_title: string;
  subgroup?: string;
};

type Props = {
  leftProgramTitle: string;
  rightProgramTitle: string;

  groupedParams: Record<string, ParamRow[]>;
  leftValues: Record<string, any>;
  rightValues: Record<string, any>;

  formatValue: (value: any, paramKey?: string, paramTitle?: string) => React.ReactNode;

  safeLeftId: string;
  safeRightId: string;
  showDiffOnly: boolean;
};
function normalizeForCompare(value: any) {
  if (value === null || value === undefined) return "";

  let raw = String(value).replace(/\s+/g, " ").trim();
  const lowered = raw.toLowerCase();

  if (raw === "—" || raw === "-" || raw === "–" || lowered === "нет данных" || lowered === "n/a") {
    return "";
  }

  if (typeof value === "boolean") return value ? "1" : "0";

  const numCandidate = raw
    .replace(/\s/g, "")
    .replace(/[^\d,.\-]/g, "")
    .replace(",", ".");
  const num = Number(numCandidate);

  if (!Number.isNaN(num) && /[\d]/.test(raw)) return String(num);

  return lowered;
}

function isDifferent(leftVal: any, rightVal: any) {
  return normalizeForCompare(leftVal) !== normalizeForCompare(rightVal);
}
export default function MobileCompareList({
  leftProgramTitle,
  rightProgramTitle,
  groupedParams,
  leftValues,
  rightValues,
  formatValue,
  safeLeftId,
  safeRightId,
  showDiffOnly,
}: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const visibleGroupedParams = useMemo(() => {
  if (!showDiffOnly) return groupedParams;

  const out: Record<string, ParamRow[]> = {};

  for (const [subgroup, params] of Object.entries(groupedParams)) {
    const filtered = params.filter((p) =>
      isDifferent(leftValues[p.param_key], rightValues[p.param_key])
    );

    if (filtered.length > 0) out[subgroup] = filtered;
  }

  return out;
}, [showDiffOnly, groupedParams, leftValues, rightValues]);

  const subGroups = useMemo(
    () => Object.keys(visibleGroupedParams),
    [visibleGroupedParams]
  );

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="pcMobile">
      <div className="pcMobile__header">
        <div className="pcMobile__colTitle">Программа 1</div>
        <div className="pcMobile__colValue">{leftProgramTitle}</div>

        <div className="pcMobile__colTitle">Программа 2</div>
        <div className="pcMobile__colValue">{rightProgramTitle}</div>
      </div>

      <div className="pcMobile__groups">
        {subGroups.map((sg) => {
          const isOpen = sg === "О программе" ? true : open[sg];
          const list = visibleGroupedParams[sg] ?? [];

          return (
            <div key={sg} className="pcMobile__group">
              <button
                type="button"
                className="pcMobile__groupBtn"
                onClick={() => toggle(sg)}
              >
                <span className="pcMobile__chev">{isOpen ? "▼" : "▶"}</span>
                <span className="pcMobile__groupTitle">{sg}</span>
              </button>

              {isOpen && (
                <div className="pcMobile__items">
                  {list.map((p) => {
  const isLongText = p.param_key === "характеристика";

  return (
    <div
      key={p.param_key}
      className={`pcMobile__item ${isLongText ? "pcMobile__item--stack" : ""}`}
    >
      <div className="pcMobile__paramTitle">{p.param_title}</div>

      {isLongText ? (
        <div className="pcMobile__stack">
          <div className="pcMobile__stackBlock">
            <div className="pcMobile__sideLabel">Программа 1</div>
            <div className="pcMobile__sideValue">
              {formatValue(leftValues[p.param_key], p.param_key, p.param_title)}
            </div>
          </div>

          <div className="pcMobile__stackBlock">
            <div className="pcMobile__sideLabel">Программа 2</div>
            <div className="pcMobile__sideValue">
              {formatValue(rightValues[p.param_key], p.param_key, p.param_title)}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="pcMobile__row">
            <div className="pcMobile__sideLabel">Программа 1</div>
            <div className="pcMobile__sideValue">
              {formatValue(leftValues[p.param_key], p.param_key, p.param_title)}
            </div>
          </div>

          <div className="pcMobile__row">
            <div className="pcMobile__sideLabel">Программа 2</div>
            <div className="pcMobile__sideValue">
              {formatValue(rightValues[p.param_key], p.param_key, p.param_title)}
            </div>
          </div>
        </>
      )}
    </div>
  );
})}

                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pcMobile__actions">
        <a
          className="pc__btn"
          href={`https://www.ranepa.ru/bakalavriat/napravleniya-i-programmy/${safeLeftId}/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Подробнее о программе 1
        </a>

        <a
          className="pc__btn"
          href={`https://www.ranepa.ru/bakalavriat/napravleniya-i-programmy/${safeRightId}/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Подробнее о программе 2
        </a>
      </div>
    </div>
  );
}
