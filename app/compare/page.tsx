import { Suspense } from "react";
import ProgramCompare from "@/src/components/program-compare/ProgramCompare";

export default function ComparePage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Сравнение образовательных программ</h1>

      <Suspense fallback={<div>Загрузка сравнения...</div>}>
        <ProgramCompare />
      </Suspense>
    </main>
  );
}
