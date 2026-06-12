"use client";

import { signOut } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthPoint } from "@/lib/parser";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardData {
  sessions:    MonthPoint[];
  trials:      MonthPoint[];
  newPayments: MonthPoint[];
  newSellers:  MonthPoint[];
}

// ── Metric config ──────────────────────────────────────────────────────────────
const METRICS = [
  { key: "sessions",    label: "Sessões",          color: "#6366f1" },
  { key: "trials",      label: "Trials",            color: "#8b5cf6" },
  { key: "newPayments", label: "Novos Pagamentos",  color: "#a855f7" },
  { key: "newSellers",  label: "Novos Vendedores",  color: "#d946ef" },
] as const;

// ── Main component ─────────────────────────────────────────────────────────────
export default function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Painel de Afiliados</h1>
          <p className="text-sm text-gray-400">Resultados mensais</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500"
        >
          Sair
        </button>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        {METRICS.map(({ key, label, color }) => {
          const points = data[key];
          const total = points.reduce((s, p) => s + p.value, 0);
          return (
            <div key={key} className="rounded-xl bg-gray-900 border border-gray-800 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-3xl font-bold" style={{ color }}>{total.toLocaleString("pt-BR")}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 px-6 pb-6 sm:grid-cols-2">
        {METRICS.map(({ key, label, color }) => {
          const points = data[key];
          return (
            <div key={key} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">{label} por mês</h2>
              {points.length === 0 ? (
                <p className="text-gray-500 text-sm">Sem dados disponíveis.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="monthLabel" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }}
                      labelStyle={{ color: "#e5e7eb" }}
                      itemStyle={{ color }}
                    />
                    <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} name={label} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
