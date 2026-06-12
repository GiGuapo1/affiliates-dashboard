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

  // — Fetch all months for each metric ────────────────────────────────────────
  const [
    sessionsSheets,
    trialsSheets,
    npSheets,
    nsSheets,
  ] = await Promise.all([
    getAllSheets(SHEET_IDS.sessions),
    getAllSheets(SHEET_IDS.trials),
    getAllSheets(SHEET_IDS.newPayments),
    getAllSheets(SHEET_IDS.newSellers),
  ]);

  // Helper: flatten WeekPoints across all months, then aggregate to MonthPoints
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
