import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllSheets, getSpreadsheetIds } from "@/lib/sheets";
import { extractMetric, aggregateMonthly } from "@/lib/parser";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const partnerCode = (session.user as { partnerCode?: string }).partnerCode;
  if (!partnerCode) redirect("/login");

  // ── Fetch data from Google Sheets ───────────────────────────────────────────
  const ids = getSpreadsheetIds();

  // Fetch weekly sheets (Maio 2025 + late Abril) and monthly sheets (full month totals) in parallel
  const [
    sessionsWeekSheets, trialsWeekSheets, npWeekSheets, nsWeekSheets,
    sessionsMthSheets,  trialsMthSheets,  npMthSheets,  nsMthSheets,
  ] = await Promise.all([
    getAllSheets(ids.weekly.sessions),
    getAllSheets(ids.weekly.trials),
    getAllSheets(ids.weekly.newPayments),
    getAllSheets(ids.weekly.newSellers),
    getAllSheets(ids.monthly.sessions),
    getAllSheets(ids.monthly.trials),
    getAllSheets(ids.monthly.newPayments),
    getAllSheets(ids.monthly.newSellers),
  ]);

  // ── Extract affiliate data ──────────────────────────────────────────────────
  const data = {
    sessions: {
      weekly:  extractMetric(sessionsWeekSheets, partnerCode),
      monthly: aggregateMonthly(extractMetric(sessionsMthSheets, partnerCode)),
    },
    trials: {
      weekly:  extractMetric(trialsWeekSheets, partnerCode),
      monthly: aggregateMonthly(extractMetric(trialsMthSheets, partnerCode)),
    },
    newPayments: {
      weekly:  extractMetric(npWeekSheets, partnerCode),
      monthly: aggregateMonthly(extractMetric(npMthSheets, partnerCode)),
    },
    newSellers: {
      weekly:  extractMetric(nsWeekSheets, partnerCode),
      monthly: aggregateMonthly(extractMetric(nsMthSheets, partnerCode)),
    },
  };

  return (
    <DashboardClient
      affiliateName={session.user.name ?? partnerCode}
      partnerCode={partnerCode}
      data={data}
    />
  );
}
