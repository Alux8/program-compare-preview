import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const INPUT = path.resolve("data/Тестируем ALUX.xlsx");
const OUT_DIR = path.resolve("src/data/compare");

const OUT_PROGRAMS = path.join(OUT_DIR, "programs.json");
const OUT_PARAMS = path.join(OUT_DIR, "params.json");
const OUT_VALUES = path.join(OUT_DIR, "values.json");

const slugKey = (k) =>
  String(k)
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");

const toSixDigits = (v) => String(v ?? "").trim().padStart(6, "0");

const toValue = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const s = String(v).trim();

  const low = s.toLowerCase();
  if (["есть", "да", "true", "1", "yes"].includes(low)) return 1;
  if (["нет", "false", "0", "no"].includes(low)) return 0;

  const cleaned = s.replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  if (Number.isFinite(n) && cleaned !== "") return n;

  return s;
};

const wb = xlsx.readFile(INPUT);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

if (!rows.length) {
  console.log("❌ Excel пустой");
  process.exit(1);
}

const headers = Object.keys(rows[0]);

// Точные названия колонок из Excel:
const COL_ACTIVE = "Active";
const COL_ID = "ID программы";
const COL_TITLE = "Наименование программы";

const SYSTEM_COLS = new Set([COL_ACTIVE, COL_ID, COL_TITLE]);
const paramHeaders = headers.filter((h) => !SYSTEM_COLS.has(h));

const activeRows = rows.filter(
  (r) => String(r[COL_ACTIVE]).trim().toLowerCase() === "yes"
);

// programs.json
const programs = activeRows
  .map((r) => ({
    program_id: toSixDigits(r[COL_ID]),
    program_title: String(r[COL_TITLE] ?? "").trim(),
  }))
  .filter((p) => p.program_id && p.program_title);

// params.json
const params = paramHeaders.map((h) => ({
  param_key: slugKey(h),
  param_title: String(h).trim(),
  group: "Общее",
}));

// values.json
const values = [];
for (const r of activeRows) {
  const program_id = toSixDigits(r[COL_ID]);
  if (!program_id) continue;

  for (const h of paramHeaders) {
    values.push({
      program_id,
      param_key: slugKey(h),
      value: toValue(r[h]),
    });
  }
}

const REBUILD_PARAMS = process.argv.includes("--rebuild-params");

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_PROGRAMS, JSON.stringify(programs, null, 2), "utf8");

if (REBUILD_PARAMS) {
  fs.writeFileSync(OUT_PARAMS, JSON.stringify(params, null, 2), "utf8");
  console.log("✅ params rebuilt");
} else {
  console.log("⏭️ params kept (use --rebuild-params to regenerate)");
}

fs.writeFileSync(OUT_VALUES, JSON.stringify(values, null, 2), "utf8");

console.log(`✅ saved to ${OUT_DIR}`);
console.log(`✅ programs: ${programs.length}`);
console.log(`✅ params: ${params.length}`);
console.log(`✅ values: ${values.length}`);
