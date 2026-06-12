import { unstable_cache } from "next/cache";

// ── Sheet names ───────────────────────────────────────────────────────────────

const SHEET_NAMES = ["Ecommerce", "Dropshipping", "Comunidade"] as const;
type SheetName = (typeof SHEET_NAMES)[number];

// ── gviz response parser ──────────────────────────────────────────────────────

function parseGvizResponse(text: string): string[][] {
  const jsonStart = text.indexOf("(") + 1;
  const jsonEnd = text.lastIndexOf(")");
  if (jsonStart <= 0 || jsonEnd <= 0) return [];

  let json: { status: string; table: { cols: unknown[]; rows: Array<{ c: Array<{ v: unknown } | null> }> } };
  try {
    json = JSON.parse(text.slice(jsonStart, jsonEnd));
  } catch {
    return [];
  }

  if (json.status !== "ok" || !json.table) return [];

  const { cols, rows } = json.table;

  return rows.map((row) => {
    const cells = row.c ?? [];
    return Array.from({ length: cols.length }, (_, i) => {
      const cell = cells[i];
      if (!cell || cell.v === null || cell.v === undefined) return "";
      return String(cell.v);
    });
  });
}

// ── Raw fetcher ───────────────────────────────────────────────────────────────

async function fetchSheetRaw(
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet "${sheetName}": HTTP ${res.status}`);
  }

  const text = await res.text();
  return parseGvizResponse(text);
}

// Cache for 5 minutes
const cachedFetch = unstable_cache(
  async (spreadsheetId: string, sheetName: string) =>
    fetchSheetRaw(spreadsheetId, sheetName),
  ["sheet-data"],
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

export function getSpreadsheetIds() {
  return {
    sessions: process.env.SHEETS_SESSIONS_ID ?? "",
    trials: process.env.SHEETS_TRIALS_ID ?? "",
    newPayments: process.env.SHEETS_NP_ID ?? "",
    newSellers: process.env.SHEETS_NS_ID ?? "",
  };
}
