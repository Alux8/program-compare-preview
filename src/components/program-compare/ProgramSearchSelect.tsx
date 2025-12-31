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

  return (
    <div className="border rounded p-4 space-y-2" ref={wrapRef}>
      <div className="text-sm text-gray-500">{label}</div>

      <input
        className="w-full border rounded p-2"
        value={query}
        placeholder="Начни вводить название или ID…"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />

      <div className="text-xs text-gray-500">ID: {valueId}</div>

      {open && (
        <div className="border rounded mt-2 max-h-64 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">Ничего не найдено</div>
          ) : (
            filtered.map((p) => {
              const id = String(p.program_id);
              const active = id === String(valueId);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => pick(id)}
                  className={
                    "w-full text-left p-2 text-sm border-b last:border-b-0 hover:bg-gray-50 " +
                    (active ? "bg-gray-100" : "")
                  }
                >
                  <div className="font-medium">{p.program_title}</div>
                  <div className="text-xs text-gray-500">ID: {id}</div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
