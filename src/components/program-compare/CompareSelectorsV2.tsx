"use client";

import React from "react";
import ProgramSearchSelectV2 from "./ProgramSearchSelectV2";

type ProgramRow = {
  program_id: string;
  program_title: string;
  program_link?: string;
};

type Props = {
  programs: ProgramRow[];
  leftProgram: ProgramRow | null;
  rightProgram: ProgramRow | null;
  setLeftProgramId: (id: string) => void;
  setRightProgramId: (id: string) => void;
};

export default function CompareSelectorsV2({
  programs,
  leftProgram,
  rightProgram,
  setLeftProgramId,
  setRightProgramId,
}: Props) {
  if (!Array.isArray(programs) || programs.length === 0) {
    return <div className="pcV2__hint">Нет списка программ для выбора.</div>;
  }

  return (
    <div className="pcV2__selectorsRow">
      <ProgramSearchSelectV2
        label="Программа 1"
        programs={programs}
        valueId={leftProgram?.program_id ?? ""}
        onChange={setLeftProgramId}
      />

      <ProgramSearchSelectV2
        label="Программа 2"
        programs={programs}
        valueId={rightProgram?.program_id ?? ""}
        onChange={setRightProgramId}
      />
    </div>
  );
}
