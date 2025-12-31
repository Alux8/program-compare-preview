import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

const INPUT = path.resolve("data/Тестируем ALUX.xlsx");

const OUT_DIR = path.resolve("src/data/compare");
const OUT_PROGRAMS = path.join(OUT_DIR, "programs.json");
const OUT_PARAMS = path.join(OUT_DIR, "params.json");
const OUT_VALUES = path.join(OUT_DIR, "values.json");

// --- helpers ---
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

  // булевы
  const s = String(v).trim().toLowerCase();
  if (["есть", "да", "true", "1", "yes"].includes(s)) return 1;
  if (["нет", "false", "0", "no"].includes(s)) return 0;

  // числа (350 000 / 350000 / 350,000)
  const cleaned = String(v).replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  if (Number.isFinite(n) && cleaned !== "") return n;

  // иначе строка
  return String(v).trim();
};

// --- read excel ---
const wb = xlsx.readFile(INPUT);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

if (!rows.length) {
  console.log("❌ Excel пустой");
  process.exit(1);
}

// Берем заголовки из первой строки объекта
const headers = Object.keys(rows[0]);

// Подстрой названия служебных колонок под твою таблицу:
const COL_ACTIVE = "Active";
const COL_ID = "ID программы";
const COL_TITLE = "Наименование программы";

const SYSTEM_COLS = new Set([
  COL_ACTIVE,
  COL_ID,
  COL_TITLE
]);


// --- programs.json ---
const programs = rows
  .filter(r => String(r[COL_ACTIVE]).toLowerCase() === "yes")
  .map((r) => ({
    program_id: toSixDigits(r[COL_ID]),
    program_title: String(r[COL_TITLE] ?? "").trim(),
  }))
  .filter((p) => p.program_id && p.program_title);


// --- params.json ---
const paramHeaders = headers.filter((h) => !SYSTEM_COLS.has(h));

const params = paramHeaders.map((h) => ({
  param_key: slugKey(h),
  param_title: String(h).trim(),
  group: "Общее", // пока так. Потом сделаем умную группировку.
}));

// --- values.json ---
const values = [];
for (const r of rows) {
  const program_id = toSixDigits(r[COL_ID]);
  if (!program_id) continue;

  for (const h of paramHeaders) {
    const param_key = slugKey(h);
    const value = toValue(r[h]);
    values.push({ program_id, param_key, value });
  }
}

// --- write files ---
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_PROGRAMS, JSON.stringify(programs, null, 2), "utf8");
fs.writeFileSync(OUT_PARAMS, JSON.stringify(params, null, 2), "utf8");
fs.writeFileSync(OUT_VALUES, JSON.stringify(values, null, 2), "utf8");

console.log(`✅ programs: ${programs.length}`);
console.log(`✅ params: ${params.length}`);
console.log(`✅ values: ${values.length}`);
console.log(`📦 saved to ${OUT_DIR}`);
