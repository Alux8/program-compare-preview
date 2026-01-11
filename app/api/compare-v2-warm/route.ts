import { NextRequest } from "next/server";
import { unstable_noStore as noStore } from "next/cache";

import { getCompareV2Data } from "@/components/program-compare/getCompareV2Data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  noStore();

  const startedAt = Date.now();
  const ts = new Date().toISOString();

  // === CRON AUTH (Vercel way) ===
  const secretFromEnv = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization"); // <-- ВАЖНО

  if (!secretFromEnv) {
    console.error("[CRON compare-v2-warm] missing CRON_SECRET env", { ts });
    return Response.json(
      { ok: false, error: "server_misconfigured", ts },
      { status: 500 }
    );
  }

  const expectedAuth = `Bearer ${secretFromEnv}`;

  if (authHeader !== expectedAuth) {
    console.warn("[CRON compare-v2-warm] unauthorized", {
      ts,
      hasAuth: Boolean(authHeader),
    });

    return Response.json(
      { ok: false, error: "unauthorized", ts },
      { status: 401 }
    );
  }

  console.log("[CRON compare-v2-warm] start", { ts });

  try {
    const data = await getCompareV2Data();

    const tookMs = Date.now() - startedAt;

    console.log("[CRON compare-v2-warm] done", {
      ts,
      tookMs,
      programs: data.programs.length,
      params: data.params.length,
      values: data.values.length,
    });

    return Response.json({
      ok: true,
      programs: data.programs.length,
      params: data.params.length,
      values: data.values.length,
      tookMs,
      ts,
    });
  } catch (err: any) {
    const tookMs = Date.now() - startedAt;

    console.error("[CRON compare-v2-warm] fail", {
      ts,
      tookMs,
      error: err?.message ?? String(err),
    });

    return Response.json(
      {
        ok: false,
        error: err?.message ?? "unknown_error",
        tookMs,
        ts,
      },
      { status: 500 }
    );
  }
}
