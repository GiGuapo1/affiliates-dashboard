"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WeekPoint, MonthPoint } from "@/lib/parser";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MetricSeries {
  weekly: WeekPoint[];
  monthly: MonthPoint[];
}

interface DashboardData {
  sessions: MetricSeries;
  trials: MetricSeries;
  newPayments: MetricSeries;
  newSellers: MetricSeries;
}

interface Props {
  affiliateName: string;
  partnerCode: string;
  data: DashboardData;
}

// ── Metric config ─────────────────────────────────────────────────────────────

const METRICS = [
  { key: "sessions",    label: "Sessões",       color: "#3B82F6", icon: "👁" },
  { key: "trials",      label: "Trials",        color: "#8B5CF6", icon: "🚀" },
  { key: "newPayments", label: "New Payments",  color: "#10B981", icon: "💳" },
  { key: "newSellers",  label: "New Sellers",   color: "#F59E0B", icon: "🏪" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function total(series: WeekPoint[] | MonthPoint[]) {
  return series.reduce((sum, pt) => sum + pt.value, 0);
}

function shortLabel(label: string) {
  // "19 a 25/04" → "19/04"  |  "31/05 a 06/06" → "31/05"
  const parts = label.split(" a ");
  return parts[0].includes("/") ? parts[0] : `${parts[0]}/${parts[1].split("/")[1]}`;
}

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  color,
  icon,
  value,
  active,
  onClick,
}: {
  label: string;
  color: string;
  icon: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-xl border-2 transition-all ${
        active
          ? "border-current shadow-md scale-[1.02]"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      style={{ borderColor: active ? color : undefined, background: active ? `${color}08` : undefined }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {active && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
            selecionado
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {value.toLocaleString("pt-BR")}
      </p>
    </button>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: <strong>{p.value.toLocaleString("pt-BR")}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardClient({ affiliateName, partnerCode, data }: Props) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [activeMetric, setActiveMetric] = useState<MetricKey>("sessions");

  const metric = METRICS.find((m) => m.key === activeMetric)!;

  // Build chart data
  const chartPoints = period === "weekly"
    ? data[activeMetric].weekly.map((pt) => ({
        name: shortLabel(pt.label),
        [metric.label]: pt.value,
      }))
    : data[activeMetric].monthly.map((pt) => ({
        name: pt.monthLabel,
        [metric.label]: pt.value,
      }));

  // Totals (sum of all weekly data)
  const totals = {
    sessions:    total(data.sessions.weekly),
    trials:      total(data.trials.weekly),
    newPayments: total(data.newPayments.weekly),
    newSellers:  total(data.newSellers.weekly),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 leading-none">Portal de Afiliados</h1>
              <p className="text-xs text-gray-500 mt-0.5">{affiliateName} · {partnerCode}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Sair →
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Period toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Resultados</h2>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {(["weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  period === p
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p === "weekly" ? "Semanal" : "Mensal"}
              </button>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((m) => (
            <MetricCard
              key={m.key}
              label={m.label}
              color={m.color}
              icon={m.icon}
              value={totals[m.key]}
              active={activeMetric === m.key}
              onClick={() => setActiveMetric(m.key)}
            />
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">
              {metric.label} ℔ visão {period === "weekly" ? "semanal" : "mensal"}
            </h3>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
              style={{ background: metric.color }}
            >
              Total: {totals[activeMetric].toLocaleString("pt-BR")}
            </span>
          </div>

          {chartPoints.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Nenhum dado encontrado para este afiliado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartPoints} barSize={period === "weekly" ? 28 : 48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: `${metric.color}10` }} />
                <Bar
                  dataKey={metric.label}
                  fill={metric.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Data table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Detalhamento — {metric.label}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    {period === "weekly" ? "Semana" : "Mês"}
                  </th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(period === "weekly"
                  ? data[activeMetric].weekly.map((pt) => ({ label: pt.label, value: pt.value }))
                  : data[activeMetric].monthly.map((pt) => ({ label: pt.monthLabel, value: pt.value }))
                ).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-gray-700">{row.label}</td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">
                      {row.value.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 pb-4">
          Dados atualizados manualmente · clique em uma métrica para ver seu gráfico
        </p>
      </main>
    </div>
  );
}
