import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllSheets, SHEET_IDS } from "@/lib/sheets";
import { extractMetric, aggregateMonthly } from "@/lib/parser";
import DashboardClient from "@/components/DashboardClient";

// ── Monthly value overrides ───────────────────────────────────────────────────
// Update this map to correct monthly totals per partner.
// Format: { metric: { partnerCode: { "Month YYYY": correctValue } } }
const MONTHLY_OVERRIDES: Record<string, Record<string, Record<string, number>>> = {
  trials:      { "s2-tecnologia": { "Maio 2025": 90 } },
    sessions:    { "s2-tecnologia": { "Maio 2025": 767, "Junho 2025": 355 } },
      newPayments: { "ajudavitor": { "Maio 2025": 61 }, "jesue-tome": { "Maio 2025": 21 } },
        newSellers:  {},
        };

        // Map login partner codes to sheet partner codes where they differ
        const PARTNER_CODE_MAP: Record<string, string> = {
          "ajuda-vitor": "ajudavitor",
          };

        function applyOverrides(
          metric: string,
            partnerCode: string,
              monthly: { monthLabel: string; value: number }[]
              ): { monthLabel: string; value: number }[] {
                const overrides = MONTHLY_OVERRIDES[metric]?.[partnerCode] ?? {};
                  return monthly.map((p) => ({ ...p, value: overrides[p.monthLabel] ?? p.value }));
                  }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const partnerCode = (session.user as { partnerCode?: string }).partnerCode;
  const resolvedCode = PARTNER_CODE_MAP[partnerCode!] ?? partnerCode!;
  if (!partnerCode) redirect("/login");

  const [sessionsSheets, trialsSheets, npSheets, nsSheets] = await Promise.all([
    Promise.all(SHEET_IDS.sessions.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.trials.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.newPayments.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.newSellers.map((id) => getAllSheets(id))),
  ]);

  function buildMonthly(sheetsPerMonth: Record<string, string[][]>[]) {
      const map = new Map<string, number>();
      [...sheetsPerMonth].reverse().forEach(s => aggregateMonthly(extractMetric(s, resolvedCode)).forEach(p => map.set(p.monthLabel, p.value)));
    const PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    return [...map.entries()].map(([ml,v])=>({monthLabel:ml,value:v})).sort((a,b)=>{const f=(s:string)=>{const[m,y]=s.split(" ");return+y*100+PT.indexOf(m);};return f(a.monthLabel)-f(b.monthLabel);});
  }

  const data = {
    sessions:    applyOverrides("sessions", partnerCode, buildMonthly(sessionsSheets)),
    trials:      applyOverrides("trials", partnerCode, buildMonthly(trialsSheets)),
    newPayments: applyOverrides("newPayments", partnerCode, buildMonthly(npSheets)),
    newSellers:  applyOverrides("newSellers", partnerCode, buildMonthly(nsSheets)),
  };

  return <DashboardClient data={data} partnerCode={partnerCode} />;
}
