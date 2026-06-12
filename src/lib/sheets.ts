import { unstable_cache } from "next/cache";

// ── Sheet names ───────────────────────────────────────────────────────────────

const SHEET_NAMES = ["Ecommerce", "Dropshipping", "Comunidade"] as const;
type SheetName = (typeof SHEET_NAMES)[number];

// ── gviz response parser ──────────────────────────────────────────────────────

/**
 * Google Sheets exposes a public gviz/tq endpoint for publicly-shared sheets.
 * Response format: /*O_o*\/\ngoogle.visualization.Query.setResponse({...});
 */
function parseGvizResponse(text: string): string[][] {
  // Strip JSONP wrapper
  const jsonStart = text.indexOf("(") + 1;
  const jsonEnd = text.lastIndexOf(")");
  if (jsonStart <= 0 || jsonEnd <= 0) return [];

  let json: { status: string; table: { cols: Array<{ label: string }>; rows: Array<{ c: Array<{ v: unknown } | null> }> } };
  try {
    json = JSON.parse(text.slice(jsonStart, jsonEnd));
  } catch {
    return [];
  }

  if (json.status !== "ok" || !json.table) return [];

  const { cols, rows } = json.table;

  // gviz treats the first sheet row as column headers (stored in cols[].label).
  // Prepend them as row 0 so the parser can find week labels like "19 a 25/04".
  const headerRow = cols.map((col) => col.label ?? "");

  const dataRows = rows.map((row) => {
    const cells = row.c ?? [];
    return Array.from({ length: cols.length }, (_, i) => {
      const cell = cells[i];
      if (!cell || cell.v === null || cell.v === undefined) return "";
      return String(cell.v);
    });
  });

  return [headerRow, ...dataRows];
}

// ── Raw fetcher ───────────────────────────────────────────────────────────────

async function fetchSheetRaw(
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  // 404 = tab doesn't exist in this spreadsheet; return empty gracefully
  if (!res.ok) {
    console.error(`Failed to fetch sheet "${sheetName}": HTTP ${res.status}`);
    return [];
  }

  const text = await res.text();
  return parseGvizResponse(text);
}

// Cache for 5 minutes to avoid hammering the Sheets endpoint
const cachedFetch = unstable_cache(
  async (spreadsheetId: string, sheetName: string) =>
    fetchSheetRaw(spreadsheetId, sheetName),
  ["sheet-data"],
  { revalidate: 300 }
);

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Returns all rows from all 3 tabs of a spreadsheet.
 * Shape: { Ecommerce: string[][], Dropshipping: string[][], Comunidade: string[][] }
 */
export async function getAllSheets(
  spreadsheetId: string
): Promise<Record<SheetName, string[][]>> {
  const results = await Promise.all(
    SHEET_NAMES.map((name) => cachedFetch(spreadsheetId, name))
  );
  return Object.fromEntries(
    SHEET_NAMES.map((name, i) => [name, results[i]])
  ) as Record<SheetName, string[][]>;
}

// ── Sheet IDs ─────────────────────────────────────────────────────────────────
// Update these IDs when new monthly sheets are provided.

const SHEET_IDS = {
  sessions:    "14rxLdX59uJXVkK8407r0cGnoc0cIcICzlEzTEgk845g", // Abril 2025
  trials:      "1PqnVRzmIxnyx7eBSIZ5fdUpUmTTqZZcdOjOawQzUmdk", // Abril 2025
  newPayments: "1QmWQy00_w2_i-fiSoClmFt1zJ5-pJiGcN6uNm0s4N6I", // Abril 2025
  newSellers:  "1-DW7rJiHBd0m-Hlf1VeuXdDd3QdrN5uTT4fWlUGnpPY", // Abril 2025
} as const;

export function getSpreadsheetIds() {
  return SHEET_IDS;
}
