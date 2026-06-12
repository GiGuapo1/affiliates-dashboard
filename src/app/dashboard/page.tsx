import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllSheets, SHEET_IDS } from "@/lib/sheets";
import { extractMetric, aggregateMonthly } from "@/lib/parser";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  // — Auth check ──────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const partnerCode = (session.user as { partnerCode?: string }).partnerCode;
  if (!partnerCode) redirect("/login");

  // — Fetch each month's sheets for every metric ───────────────────────────────
  // getAllSheets takes a single spreadsheet ID; we call it once per month.
  const [
    sessionsSheets,
    trialsSheets,
    npSheets,
    nsSheets,
  ] = await Promise.all([
    Promise.all(SHEET_IDS.sessions.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.trials.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.newPayments.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.newSellers.map((id) => getAllSheets(id))),
  ]);

  // Helper: extract + aggregate across all months
  function buildMonthly(sheetsPerMonth: Record<string, string[][]>[]) {
    const allPoints = sheetsPerMonth.flatMap((s) => extractMetric(s, partnerCode!));
    return aggregateMonthly(allPoints);
  }

  const data = {
    sessions:    buildMonthly(sessionsSheets),
    trials:      buildMonthly(trialsSheets),
    newPayments: buildMonthly(npSheets),
    newSellers:  buildMonthly(nsSheets),
  };

  return <DashboardClient data={data} />;
}
