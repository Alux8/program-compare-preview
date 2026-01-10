import { Suspense } from "react";
import ProgramCompare from "@/components/program-compare/ProgramCompare";

export default function ComparePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-5">
        <h1 className="text-3xl font-semibold text-[#171520]">
          Сравнение образовательных программ
        </h1>
        <p className="mt-2 text-sm text-[#85848B]">
          Выберите две программы и сравните параметры. Можно включить только различия.
        </p>
      </header>

      <section className="rounded-2xl border border-[#EDEBF2] bg-white p-4 sm:p-6">
        <Suspense fallback={<div className="text-sm text-[#85848B]">Загрузка сравнения...</div>}>
          <ProgramCompare />
        </Suspense>
      </section>
    </main>
  );
}
