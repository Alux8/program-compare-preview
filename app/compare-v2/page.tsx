import ProgramCompareV2 from "../../src/components/program-compare/ProgramCompareV2";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function CompareV2Page({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams ?? {});
  const raw = sp.page;
  const pageStr = Array.isArray(raw) ? raw[0] : raw;
  const page = Number(pageStr ?? "1") || 1;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold text-[#171520]">
          Сравнение образовательных программ
        </h1>
        <p className="mt-2 text-sm text-[#85848B]">
          Версия 2: данные загружаются server-side.
          Выберите две программы и сравните параметры. Можно включить только различия.
        </p>
      </header>

      <section className="rounded-2xl border border-[#EDEBF2] bg-white p-4 sm:p-4">
        <ProgramCompareV2 page={page} />
      </section>
    </main>
  );
}
