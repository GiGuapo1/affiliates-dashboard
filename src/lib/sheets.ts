import { google } from "googleapis";
import { unstable_cache } from "next/cache";

function getGoogleAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

async function fetchSheetRaw(
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const auth = getGoogleAuth();
  const sheetsApi = google.sheets({ version: "v4", auth });

  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  return (res.data.values ?? []) as string[][];
}

const SHEET_NAMES = ["Ecommerce", "Dropshipping", "Comunidade"] as const;
type SheetName = (typeof SHEET_NAMES)[number];

const cachedFetch = unstable_cache(
  async (spreadsheetId: string, sheetName: string) =>
    fetchSheetRaw(spreadsheetId, sheetName),
  ["sheet-data"],
  { revalidate: 300 }
);

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
