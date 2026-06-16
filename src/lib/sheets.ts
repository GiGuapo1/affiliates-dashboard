import { unstable_cache } from "next/cache";

export const SHEET_IDS = {
    sessions:    ["14rxLdX59uJXVkK8407r0cGnoc0cIcICzlEzTEgk845g", "1UvkyCmqKaHEDB_gMwpyqvXl1qwBUXho_RvRectjtBfQ"],
    trials:      ["1PqnVRzmIxnyx7eBSIZ5fdUpUmTTqZZcdOjOawQzUmdk", "1c_cNHDqGQZDKX-FalvZuJRdmG-Zmo5tMSaNkzLo542w"],
    newPayments: ["1QmWQy00_w2_i-fiSoClmFt1zJ5-pJiGcN6uNm0s4N6I", "1vdiIgxuZKAsuJVOFjiI2oxTrp9wcg3eWYujaqymLmhs"],
    newSellers:  ["1-DW7rJiHBd0m-Hlf1VeuXdDd3QdrN5uTT4fWlUGnpPY", "1p80XabPrzssoHYbpfB7TUZ2d0q_fRZpu5qrGNnapda8"],
};

const SHEET_NAMES = ["Ecommerce", "Dropshipping", "Comunidade"] as const;
type SheetName = (typeof SHEET_NAMES)[number];

function parseGvizResponse(text: string): string[][] {
    const jsonStart = text.indexOf("(") + 1;
    const jsonEnd   = text.lastIndexOf(")");
    if (jsonStart <= 0 || jsonEnd <= 0) return [];
    let json: { status: string; table: { cols: Array<{ label: string }>; rows: Array<{ c: Array<{ v: unknown } | null> }> } };
    try { json = JSON.parse(text.slice(jsonStart, jsonEnd)); } catch { return []; }
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

async function fetchSheetRaw(spreadsheetId: string, sheetName: string): Promise<string[][]> {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    return parseGvizResponse(await res.text());
}

const cachedFetch = unstable_cache(
    async (spreadsheetId: string, sheetName: string) => fetchSheetRaw(spreadsheetId, sheetName),
    ["sheet-data-v8"],
  { revalidate: 300 }
  );

export async function getAllSheets(spreadsheetId: string): Promise<Record<SheetName, string[][]>> {
    const results = await Promise.all(SHEET_NAMES.map((name) => cachedFetch(spreadsheetId, name)));
    return Object.fromEntries(SHEET_NAMES.map((name, i) => [name, results[i]])) as Record<SheetName, string[][]>;
}
