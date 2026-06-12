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
type SheetName = (typeof SHEET_NAMES)[number];

// ── gviz response parser ──────────────────────────────────────────────────────
// Response format: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
// Row 0 = column labels (e.g. "01 a 30/04"), rows 1+ = data rows.

function parseGvizResponse(text: string): string[][] {
  const jsonStart = text.indexOf("(") + 1;
  const jsonEnd   = text.lastIndexOf(")");
  if (jsonStart <= 0 || jsonEnd <= 0) return [];

  let json: {
    status: string;
    table: {
      cols: Array<{ label: string }>;
      rows: Array<{ c: Array<{ v: unknown } | null> }>;
    };
  };
  try {
    json = JSON.parse(text.slice(jsonStart, jsonEnd));
  } catch {
    return [];
  }

  if (json.status !== "ok" || !json.table) return [];

  const { cols, rows } = json.table;

  // Row 0: column labels (contains date ranges like "01 a 30/04")
  const headerRow = cols.map((col) => col.label ?? "");

  // Rows 1+: data rows
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

async function fetchSheetRaw(spreadsheetId: string, sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const text = await res.text();
  return parseGvizResponse(text);
}

// ── Cached per (spreadsheetId, sheetName) ────────────────────────────────────
const cachedFetch = unstable_cache(
  async (spreadsheetId: string, sheetName: string) =>
    fetchSheetRaw(spreadsheetId, sheetName),
  ["sheet-data-v6"],
  { revalidate: 300 }
);

// ── Public: fetch all tabs for one spreadsheet ───────────────────────────────
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
