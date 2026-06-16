import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllSheets, SHEET_IDS } from "@/lib/sheets";
import { extractMetric, aggregateMonthly } from "@/lib/parser";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const partnerCode = (session.user as { partnerCode?: string }).partnerCode;
  if (!partnerCode) redirect("/login");

  const [sessionsSheets, trialsSheets, npSheets, nsSheets] = await Promise.all([
    Promise.all(SHEET_IDS.sessions.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.trials.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.newPayments.map((id) => getAllSheets(id))),
    Promise.all(SHEET_IDS.newSellers.map((id) => getAllSheets(id))),
  ]);

  function buildMonthly(sheetsPerMonth: Record<string, string[][]>[]) {
      const map = new Map<string, number>();
      [...sheetsPerMonth].reverse().forEach(s => aggregateMonthly(extractMetric(s, partnerCode!)).forEach(p => map.set(p.monthLabel, p.value)));
    const PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    return [...map.entries()].map(([ml,v])=>({monthLabel:ml,value:v})).sort((a,b)=>{const f=(s:string)=>{const[m,y]=s.split(" ");return+y*100+PT.indexOf(m);};return f(a.monthLabel)-f(b.monthLabel);});
  }

  const data = {
    sessions:    buildMonthly(sessionsSheets),
    trials:      buildMonthly(trialsSheets),
    newPayments: buildMonthly(npSheets),
    newSellers:  buildMonthly(nsSheets),
  };

  return <DashboardClient data={data} partnerCode={partnerCode} />;
}
