"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ProgramRow = {
  program_id: string;
  program_title: string;
};

type Props = {
  label: string;
  programs: ProgramRow[];
  valueId: string;
  onChange: (nextId: string) => void;
};

export default function ProgramSearchSelect({
  label,
  programs,
  valueId,
  onChange,
}: Props) {
  const selected = useMemo(
    () => programs.find((p) => String(p.program_id) === String(valueId)),
    [programs, valueId]
  );

  const [query, setQuery] = useState(selected?.program_title ?? "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(selected?.program_title ?? "");
  }, [selected?.program_title]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const sortedPrograms = useMemo(() => {
    return [...programs].sort((a, b) =>
      a.program_title.localeCompare(b.program_title, "ru", {
        sensitivity: "base",
      })
    );
  }, [programs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedPrograms.slice(0, 30);

    return sortedPrograms
      .filter(
        (p) =>
          p.program_title.toLowerCase().includes(q) ||
          String(p.program_id).includes(q)
      )
      .slice(0, 30);
  }, [sortedPrograms, query]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const clearQuery = () => {
    setQuery("");
    setOpen(true);
  };

  return (
    <div className="pcV2__searchSelect" ref={wrapRef}>
      <div className="pcV2__searchSelectLabel">{label}</div>

      <div className="pcV2__searchSelectField">
        <input
          className="pcV2__searchSelectInput"
          value={query}
          placeholder="Начните вводить название программы или код"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />

        {query.length > 0 && (
          <button
            type="button"
            className="pcV2__searchSelectClear"
            onClick={clearQuery}
            aria-label="Очистить"
            title="Очистить"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="pcV2__searchSelectDropdown">
          {filtered.length === 0 ? (
            <div className="pcV2__searchSelectEmpty">Ничего не найдено</div>
          ) : (
            filtered.map((p) => {
              const id = String(p.program_id);
              const active = id === String(valueId);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => pick(id)}
                  className={"pcV2__searchSelectItem " + (active ? "is-active" : "")}
                >
                  <div className="pcV2__searchSelectTitle">{p.program_title}</div>
                  <div className="pcV2__searchSelectId">ID: {id}</div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
