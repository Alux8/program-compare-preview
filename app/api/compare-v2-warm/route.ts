import { getCompareV2Data } from "@/components/program-compare/getCompareV2Data";

export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();

  // Прогрев: просто получаем данные (fetch внутри уже с revalidate)
  const data = await getCompareV2Data();

  return Response.json({
    ok: true,
    programs: data.programs.length,
    params: data.params.length,
    values: data.values.length,
    tookMs: Date.now() - startedAt,
    ts: new Date().toISOString(),
  });
}
