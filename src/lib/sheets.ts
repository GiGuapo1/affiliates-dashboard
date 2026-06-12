import { unstable_cache } from "next/cache";

// ── Sheet IDs ────────────────────────────────────────────────────────────────
// Each array holds one sheet ID per month (oldest first).
// To add a new month, append its sheet ID to the relevant array.

export const SHEET_IDS = {
  sessions:    ["14rxLdX59uJXVkK8407r0cGnoc0cIcICzlEzTEgk845g"], // Abril 2025
  trials:      ["1PqnVRzmIxnyx7eBSIZ5fdUpUmTTqZZcdOjOawQzUmdk"], // Abril 2025
  newPayments: ["1QmWQy00_w2_i-fiSoClmFt1zJ5-pJiGcN6uNm0s4N6I"], // Abril 2025
  newSellers:  ["1-DW7rJiHBd0m-Hlf1VeuXdDd3QdrN5uTT4fWlUGnpPY"], // Abril 2025
};

// ── Sheet tab names ───────────────────────────────────────────────────────────
const SHEET_NAMES = ["Ecommerce", "Dropshipping", "Consideração"] as const;

// ── gviz response parser ──────────────────────────────────────────────────────
function parseGvizResponse(text: string): string[][] {
  const jsonStart = text.indexOf("{");
  const jsonEnd   = text.lastIndexOf("}") + 1;
  if (jsonStart <= 0 || jsonEnd <= 0) return [];
  const json = JSON.parse(text.slice(jsonStart, jsonEnd));
  const cols: unknown[] = json?.table?.cols ?? [];
  const rows: unknown[] = json?.table?.rows ?? [];
  if (!cols.length || !rows.length) return [];
  return (rows as { c: ({ v: unknown } | null)[] }[]).map((row) =>
    row.c.map((cell) => (cell?.v != null ? String(cell.v) : ""))
  );
}

// ── Fetch one tab from a public Google Sheet via gviz/tq ─────────────────────
async function fetchSheetTab(spreadsheetId: string, sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return parseGvizResponse(await res.text());
}

// ── Fetch all tabs for a single spreadsheet ───────────────────────────────────
async function fetchAllTabs(spreadsheetId: string): Promise<Record<string, string[][]>> {
  const results = await Promise.all(
    SHEET_NAMES.map((name) => fetchSheetTab(spreadsheetId, name))
  );
  return Object.fromEntries(SHEET_NAMES.map((name, i) => [name, results[i]]));
}

// ── Public: fetch one spreadsheet's tabs (cached 5 min) ──────────────────────
// Call once per sheet ID. To handle multiple months, call once per ID and
// flatten the results in the caller.
export const getAllSheets = unstable_cache(
  async (spreadsheetId: string): Promise<Record<string, string[][]>> => {
    return fetchAllTabs(spreadsheetId);
  },
  ["sheet-data-v5"],
  { revalidate: 300 }
);
