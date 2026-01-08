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
    <main style={{ padding: 24 }}>
      <h1>Program Compare v2</h1>
      <ProgramCompareV2 page={page} />
    </main>
  );
}


