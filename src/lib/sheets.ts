import { unstable_cache } from "next/cache";

// ── Sheet names ───────────────────────────────────────────────────────────────

const SHEET_NAMES = ["Ecommerce", "Dropshipping", "Consideração"] as const;
type SheetName = (typeof SHEET_NAMES)[number];

// ── gviz response parser ──────────────────────────────────────────────────────

/**
 * Google Sheets exposes a public gviz/tq endpoint for publicly-shared sheets.
 * Response format: /*O_o*\/\ngoogle.visualization.Query.setResponse({...});
 */
function parseGvizResponse(text: string): string[][] {
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
  if (!res.ok) {
    console.error(`Failed to fetch sheet "${sheetName}": HTTP ${res.status}`);
    return [];
  }

  const text = await res.text();
  return parseGvizResponse(text);
}

// Cache for 5 minutes
const cachedFetch = unstable_cache(
  async (spreadsheetId: string, sheetName: string) =>
    fetchSheetRaw(spreadsheetId, sheetName),
  ["sheet-data-v3"],
  { revalidate: 300 }
);

// ── Public helpers ────────────────────────────────────────────────────────────

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

/** Weekly sheets — week-by-week data (Maio 2025 + late Abril) */
const WEEKLY_SHEET_IDS = {
  sessions:    "1UvkyCmqKaHEDB_gMwpyqvXl1qwBUXho_RvRectjtBfQ",
  trials:      "1c_cNHDqGQZDKX-FalvZuJRdmG-Zmo5tMSaNkzLo542w",
  newPayments: "1vdiIgxuZKAsuJVOFjiI2oxTrp9wcg3eWYujaqymLmhs",
  newSellers:  "1p80XabPrzssoHYbpfB7TUZ2d0q_fRZpu5qrGNnapda8",
} as const;

/** Monthly sheets — full-month totals. Add new months here as they arrive. */
const MONTHLY_SHEET_IDS = {
  sessions:    "14rxLdX59uJXVkK8407r0cGnoc0cIcICzlEzTEgk845g", // Abril 2025
  trials:      "1PqnVRzmIxnyx7eBSIZ5fdUpUmTTqZZcdOjOawQzUmdk", // Abril 2025
  newPayments: "1QmWQy00_w2_i-fiSoClmFt1zJ5-pJiGcN6uNm0s4N6I", // Abril 2025
  newSellers:  "1-DW7rJiHBd0m-Hlf1VeuXdDd3QdrN5uTT4fWlUGnpPY", // Abril 2025
} as const;

export function getSpreadsheetIds() {
  return { weekly: WEEKLY_SHEET_IDS, monthly: MONTHLY_SHEET_IDS };
}
