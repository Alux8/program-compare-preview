"use client";

import React, { useMemo, useState } from "react";

type AnyObj = Record<string, any>;

export type ApiProgramItem = {
  Program?: AnyObj;
  Sovokupnost?: AnyObj;
  levelLink?: string;
};

function getCode(item: ApiProgramItem): string {
  const code = item?.Program?.Code;
  return typeof code === "string" ? code.trim() : "";
}

function labelOf(item: ApiProgramItem): string {
  const code = getCode(item);
  const title =
    (typeof item?.Program?.Title === "string" && item.Program.Title.trim()) ||
    (typeof item?.Program?.Name === "string" && item.Program.Name.trim()) ||
    "";
  return `${code}${title ? " — " + title : ""}`;
}

export default function ComparePickerV2({ items }: { items: ApiProgramItem[] }) {
  const [q, setQ] = useState("");
  const [leftCode, setLeftCode] = useState("");
  const [rightCode, setRightCode] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((it) => {
      const code = getCode(it).toLowerCase();
      const title =
        (typeof it?.Program?.Title === "string" ? it.Program.Title : "") +
        " " +
        (typeof it?.Program?.Name === "string" ? it.Program.Name : "");
      return code.includes(query) || title.toLowerCase().includes(query);
    });
  }, [items, q]);

  const left = useMemo(() => {
    if (!leftCode) return null;
    return items.find((it) => getCode(it) === leftCode) ?? null;
  }, [items, leftCode]);

  const right = useMemo(() => {
    if (!rightCode) return null;
    return items.find((it) => getCode(it) === rightCode) ?? null;
  }, [items, rightCode]);

  return (
    <section>
      <h3 style={{ margin: "16px 0 8px" }}>Выбор программ для сравнения</h3>

      <div style={{ margin: "10px 0 14px" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по коду или названию…"
          style={{
            width: "100%",
            maxWidth: 560,
            padding: "10px 12px",
            border: "1px solid #ccc",
            borderRadius: 10,
          }}
        />
        <div style={{ color: "#666", marginTop: 6 }}>
          Найдено: {filtered.length}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Левая программа</div>
          <select
            value={leftCode}
            onChange={(e) => setLeftCode(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: 10,
            }}
          >
            <option value="">— выбери —</option>
            {filtered.map((it) => {
              const code = getCode(it);
              if (!code) return null;
              return (
                <option key={"L-" + code} value={code}>
                  {labelOf(it)}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Правая программа</div>
          <select
            value={rightCode}
            onChange={(e) => setRightCode(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: 10,
            }}
          >
            <option value="">— выбери —</option>
            {filtered.map((it) => {
              const code = getCode(it);
              if (!code) return null;
              return (
                <option key={"R-" + code} value={code}>
                  {labelOf(it)}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <h3 style={{ marginBottom: 10 }}>Сравнение</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900 }}>
          <Card title="Левая" item={left} />
          <Card title="Правая" item={right} />
        </div>
      </div>
    </section>
  );
}

function Card({ title, item }: { title: string; item: ApiProgramItem | null }) {
  if (!item) {
    return (
      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14, color: "#666" }}>
        <b>{title}:</b> не выбрано
      </div>
    );
  }

  const p = item.Program ?? {};
  const s = item.Sovokupnost ?? {};

  const code = typeof p.Code === "string" ? p.Code : "";
  const name = (typeof p.Title === "string" && p.Title) || (typeof p.Name === "string" && p.Name) || "";
  const napr = typeof p.Napr === "string" ? p.Napr : "";
  const institute = typeof p.Institute === "string" ? p.Institute : "";
  const form = typeof p.Form === "string" ? p.Form : "";
  const format = typeof p.Format === "string" ? p.Format : "";

  const year = typeof s.Year === "string" ? s.Year : "";
  const price = typeof s.Price === "string" ? s.Price : "";
  const dog = s.Mesta_Dogovor ?? "";
  const bud = s.Mesta_Budget ?? "";

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        {code} {name ? "— " + name : ""}
      </div>

      <div style={{ color: "#666", fontSize: 14, lineHeight: 1.35 }}>
        {napr ? <div>{napr}</div> : null}
        {institute ? <div>{institute}</div> : null}
        <div>
          {[form, format].filter(Boolean).join(" · ")}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 14 }}>
        {year || price ? (
          <div>
            {year ? <b>{year}</b> : null}
            {year && price ? " · " : null}
            {price ? `Цена: ${price}` : null}
          </div>
        ) : null}

        <div style={{ color: "#666", marginTop: 4 }}>
          Договор: {String(dog || "—")} · Бюджет: {String(bud || "—")}
        </div>
      </div>
    </div>
  );
}
