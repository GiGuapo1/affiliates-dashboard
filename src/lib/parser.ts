/**
 * Parses the affiliate spreadsheet format:
 *   Row 0 : "Semanas" | <week label> | null | null | <week label> | ...
 *   Row 1 : category name | "Total" | total value | null | "Total" | ...
 *   Row 2+: null | <partner_code> | value | null | <partner_code> | value | ...
 *
 * Each week block is 3 columns wide: [partner_code, value, gap]
 * Week header is at the same column index as the partner_code.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface WeekPoint {
    /** Label as it appears in the sheet: "19 a 25/04" */
  label: string;
    /** ISO start date: "2025-04-19" */
  startDate: string;
    /** ISO end date: "2025-04-25" */
  endDate: string;
    /** "Abril 2025" */
  monthLabel: string;
    value: number;
}

export interface AffiliateMetrics {
    sessions: WeekPoint[];
    trials: WeekPoint[];
    newPayments: WeekPoint[];
    newSellers: WeekPoint[];
}

// ── Date parsing ─────────────────────────────────────────────────────────────

/**
 * Parses labels like "19 a 25/04" or "31/05 a 06/06".
 * Assumes year 2025; if start month > end month it rolls over to next year.
 */
function parseWeekDates(label: string): { start: string; end: string } {
    const parts = label.trim().split(" a ");
    if (parts.length !== 2) return { start: "", end: "" };

  let startDay: number, startMonth: number, endDay: number, endMonth: number;

  if (parts[0].includes("/")) {
        // "31/05 a 06/06"
      const [sd, sm] = parts[0].split("/").map(Number);
        const [ed, em] = parts[1].split("/").map(Number);
        startDay = sd; startMonth = sm; endDay = ed; endMonth = em;
  } else {
        // "19 a 25/04" or "26 a 02/05"
      startDay = Number(parts[0]);
        const [ed, em] = parts[1].split("/").map(Number);
        endDay = ed; endMonth = em;
        // Fix: if startDay > endDay this week crosses a month boundary; start is in previous month
      startMonth = startDay > endDay ? (em === 1 ? 12 : em - 1) : em;
  }

  const year = 2026;
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
          start: `${year}-${pad(startMonth)}-${pad(startDay)}`,
          end: `${year}-${pad(endMonth)}-${pad(endDay)}`,
    };
}

const PT_MONTHS = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

function monthLabel(isoDate: string): string {
    const [year, month] = isoDate.split("-").map(Number);
    return `${PT_MONTHS[month - 1]} ${year}`;
}

// Days in each month for 2025 (not a leap year)
const MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// ── Core extractor ───────────────────────────────────────────────────────────

/**
 * Given all rows from one sheet and a partner code,
 * returns a WeekPoint[] sorted chronologically.
 */
function extractFromSheet(rows: string[][], partnerCode: string): WeekPoint[] {
    if (!rows || rows.length < 2) return [];

  const headerRow = rows[0];

  // Discover week columns: any cell in row 0 containing " a "
  const weekCols: Array<{ label: string; colIdx: number }> = [];
    for (let i = 1; i < headerRow.length; i++) {
          const cell = headerRow[i];
          if (cell && typeof cell === "string" && cell.includes(" a ")) {
                  weekCols.push({ label: cell.trim(), colIdx: i });
          }
    }

  if (weekCols.length === 0) return [];

  const points: WeekPoint[] = [];

  for (const wk of weekCols) {
        let value = 0;
        let found = false;

      // Scan from row 2 onward (row 1 = "Total" summary row)
      for (let rowIdx = 2; rowIdx < rows.length; rowIdx++) {
              const row = rows[rowIdx];
              if (!row) continue;

          // Weekly format: partner_code is at wk.colIdx, value is at wk.colIdx+1
          if ((row[wk.colIdx] ?? "").toString().trim() === partnerCode) {
                    const raw = row[wk.colIdx + 1];
                    value = raw !== undefined && raw !== "" ? Number(raw) || 0 : 0;
                    found = true;
                    break;
          }

          // Monthly format: partner_code is at wk.colIdx-1, value is at wk.colIdx
          if (wk.colIdx > 0 && (row[wk.colIdx - 1] ?? "").toString().trim() === partnerCode) {
                    const raw = row[wk.colIdx];
                    value = raw !== undefined && raw !== "" ? Number(raw) || 0 : 0;
                    found = true;
                    break;
          }
      }

      // Only include this week if partner was found
      if (found) {
              const { start, end } = parseWeekDates(wk.label);
              const smNum = Number(start.split("-")[1]);
              const sdNum = Number(start.split("-")[2]);
              const emNum = Number(end.split("-")[1]);
              const edNum = Number(end.split("-")[2]);

          // For cross-month weeks, attribute to the month containing the majority of days
          let mLabel: string;
              if (smNum !== emNum) {
                        const daysInStart = MONTH_DAYS[smNum] - sdNum + 1;
                        const daysInEnd = edNum;
                        mLabel = daysInEnd > daysInStart ? monthLabel(end) : monthLabel(start);
              } else {
                        mLabel = monthLabel(start);
              }

          points.push({
                    label: wk.label,
                    startDate: start,
                    endDate: end,
                    monthLabel: mLabel,
                    value,
          });
      }
  }

  return points.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/**
 * Searches all 3 sheets for the partner code and merges results.
 * A partner should appear in only one sheet, but we sum just in case.
 */
export function extractMetric(
    allSheets: Record<string, string[][]>,
    partnerCode: string
  ): WeekPoint[] {
    const sheetNames = ["Ecommerce", "Dropshipping", "Comunidade"];
    const byWeek = new Map<string, WeekPoint>();

  for (const name of sheetNames) {
        const rows = allSheets[name];
        if (!rows) continue;
        const points = extractFromSheet(rows, partnerCode);
        for (const pt of points) {
                if (byWeek.has(pt.label)) {
                          byWeek.get(pt.label)!.value += pt.value;
                } else {
                          byWeek.set(pt.label, { ...pt });
                }
        }
  }

  return Array.from(byWeek.values()).sort((a, b) =>
        a.startDate.localeCompare(b.startDate)
                                            );
}

// ── Monthly aggregation ──────────────────────────────────────────────────────

export interface MonthPoint {
    monthLabel: string;
    value: number;
}

export function aggregateMonthly(weeks: WeekPoint[]): MonthPoint[] {
    const map = new Map<string, number>();
    for (const w of weeks) {
          map.set(w.monthLabel, (map.get(w.monthLabel) ?? 0) + w.value);
    }
    // Preserve month order by first appearance
  const result: MonthPoint[] = [];
    const seen = new Set<string>();
    for (const w of weeks) {
          if (!seen.has(w.monthLabel)) {
                  seen.add(w.monthLabel);
                  result.push({ monthLabel: w.monthLabel, value: map.get(w.monthLabel)! });
          }
    }
    return result;
}
