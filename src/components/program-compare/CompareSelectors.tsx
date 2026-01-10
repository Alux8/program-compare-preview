"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ProgramRow = {
  program_id: string;
  program_title: string;
};

type Props = {
  programs: ProgramRow[];
  leftId: number;
  rightId: number;
};

export default function CompareSelectors({ programs, leftId, rightId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (nextLeft: number, nextRight: number) => {
    const sp = new URLSearchParams(searchParams.toString());

    // 0 = “не выбрано”
    if (nextLeft && nextLeft > 0) sp.set("left", String(nextLeft));
    else sp.delete("left");

    if (nextRight && nextRight > 0) sp.set("right", String(nextRight));
    else sp.delete("right");

    router.push(`/compare?${sp.toString()}`);
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="border rounded p-4 space-y-2">
        <div className="text-sm text-gray-500">Слева</div>
        <select
          className="w-full border rounded p-2"
          value={leftId ?? 0}
          onChange={(e) => update(Number(e.target.value), rightId)}
        >
          <option value={0}>— выберите программу —</option>
          {programs.map((p) => (
            <option key={String(p.program_id)} value={Number(p.program_id)}>
              {p.program_title}
            </option>
          ))}
        </select>
      </label>

      <label className="border rounded p-4 space-y-2">
        <div className="text-sm text-gray-500">Справа</div>
        <select
          className="w-full border rounded p-2"
          value={rightId ?? 0}
          onChange={(e) => update(leftId, Number(e.target.value))}
        >
          <option value={0}>— выберите программу —</option>
          {programs.map((p) => (
            <option key={String(p.program_id)} value={Number(p.program_id)}>
              {p.program_title}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
