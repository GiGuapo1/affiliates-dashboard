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

  const [sessionsSheets, trialsSheets, npSheets, nsSheets] = await Promise.all([
    getAllSheets(ids.sessions),
    getAllSheets(ids.trials),
    getAllSheets(ids.newPayments),
    getAllSheets(ids.newSellers),
  ]);

  // ── Extract affiliate data ──────────────────────────────────────────────────
  const sessionsWeekly   = extractMetric(sessionsSheets,   partnerCode);
  const trialsWeekly     = extractMetric(trialsSheets,     partnerCode);
  const newPaymentsWeekly = extractMetric(npSheets,        partnerCode);
  const newSellersWeekly  = extractMetric(nsSheets,        partnerCode);

  const data = {
    sessions: {
      weekly:  sessionsWeekly,
      monthly: aggregateMonthly(sessionsWeekly),
    },
    trials: {
      weekly:  trialsWeekly,
      monthly: aggregateMonthly(trialsWeekly),
    },
    newPayments: {
      weekly:  newPaymentsWeekly,
      monthly: aggregateMonthly(newPaymentsWeekly),
    },
    newSellers: {
      weekly:  newSellersWeekly,
      monthly: aggregateMonthly(newSellersWeekly),
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
