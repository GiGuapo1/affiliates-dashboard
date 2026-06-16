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
  ResponsiveContainer,  LabelList,
} from "recharts";
import type { MonthPoint } from "@/lib/parser";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardData {
  sessions:    MonthPoint[];
  trials:      MonthPoint[];
  newPayments: MonthPoint[];
  newSellers:  MonthPoint[];
}

interface Props {
  partnerCode: string;
  data: DashboardData;
}

// ── Metric config ─────────────────────────────────────────────────────────────

const METRICS = [
  {
    key: "sessions",
    label: "Sess&#xf5;es",
    labelPlain: "Sessões",
    color: "#0050C3",
    bg: "#EEF4FF",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    key: "trials",
    label: "Trials",
    labelPlain: "Trials",
    color: "#0284C7",
    bg: "#E0F2FE",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: "newPayments",
    label: "New Payments",
    labelPlain: "New Payments",
    color: "#059669",
    bg: "#ECFDF5",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    key: "newSellers",
    label: "New Sellers",
    labelPlain: "New Sellers",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function total(series: MonthPoint[]) {
  return series.reduce((sum, pt) => sum + pt.value, 0);
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm min-w-[140px]">
      <p className="font-semibold text-gray-700 mb-1.5 text-xs uppercase tracking-wide">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="text-gray-500 text-xs">{p.name}</span>
          <span className="font-bold" style={{ color: p.fill }}>
            {p.value.toLocaleString("pt-BR")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardClient({ partnerCode, data }: Props) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("sessions");

  const metric = METRICS.find((m) => m.key === activeMetric)!;

  const chartPoints = data[activeMetric].map((pt) => ({
    name: pt.monthLabel,
    [metric.labelPlain]: pt.value,
  }));

  const totals = {
    sessions:    total(data.sessions),
    trials:      total(data.trials),
    newPayments: total(data.newPayments),
    newSellers:  total(data.newSellers),
  };

  const initials = partnerCode.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "#0050C3" }}
            >
              N
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-700">Portal de Afiliados</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{partnerCode}</p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#0050C3" }}
            >
              {initials}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-400 hover:text-gray-700 transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Total acumulado de Abril até hoje · c&#xf3;digo <span className="font-medium text-gray-700">{partnerCode}</span>
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {METRICS.map((m) => {
            const isActive = activeMetric === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className="text-left p-5 rounded-2xl border-2 bg-white transition-all hover:shadow-md"
                style={{
                  borderColor: isActive ? m.color : "#E5E7EB",
                  boxShadow: isActive ? `0 0 0 4px ${m.color}18` : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: m.bg, color: m.color }}
                  >
                    {m.icon}
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                  )}
                </div>
                <p
                  className="text-xs font-medium text-gray-500 mb-1"
                  dangerouslySetInnerHTML={{ __html: m.label }}
                />
                <p className="text-2xl font-extrabold text-gray-900">
                  {totals[m.key].toLocaleString("pt-BR")}
                </p>
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="font-bold text-gray-900"
                dangerouslySetInnerHTML={{ __html: metric.label }}
              />
              <p className="text-xs text-gray-400 mt-0.5">Vis&#xe3;o mensal</p>
            </div>
            <div
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
              style={{ background: metric.color }}
            >
              Total: {totals[activeMetric].toLocaleString("pt-BR")}
            </div>
          </div>

          {chartPoints.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Nenhum dado encontrado para este afiliado.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartPoints} barSize={40} barCategoryGap="30%" margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: `${metric.color}08`, radius: 4 }}
                />
                <Bar dataKey={metric.labelPlain} fill={metric.color} radius={[6, 6, 0, 0]} >
                                <LabelList dataKey={metric.labelPlain} position="top" style={{ fontSize: 11, fontWeight: 700, fill: metric.color }} formatter={(v: number) => v.toLocaleString("pt-BR")} />
                                              </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="text-xs text-center text-gray-400 pb-4">
          Dados atualizados semanalmente &middot; clique em uma m&#xe9;trica para ver seu gr&#xe1;fico
        </p>
      </main>
    </div>
  );
}
