"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { Brain, TrendingUp, TrendingDown, Zap } from "lucide-react";

import type { AnalyticsData } from "@/lib/data/queries";

const PIE_COLORS = ["#6366F1", "#3B82F6", "#EC4899", "#F59E0B", "#64748B", "#10B981", "#8B5CF6", "#0EA5E9"];

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--muted-foreground)", marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name as string} style={{ color: p.color || (p.stroke as string), fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" ? `₹${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const router = useRouter();
  const fmt = (s: string) =>
    Number(s).toLocaleString("en-US", { maximumFractionDigits: 0 });

  const spendingPie = data.spendingByCategory.map((c, i) => ({
    name: c.category,
    value: Number(c.value),
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const largest = data.largest.length
    ? data.largest
    : [];

  const hasData = data.cashFlow.some((m) => Number(m.income) > 0 || Number(m.expenses) > 0);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }} className="responsive-padding">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
              margin: "0 0 4px",
            }}
          >
            Analytics
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
            Deep analysis of your financial patterns
          </p>
        </div>
        <button
          onClick={() => router.push("/ai-assistant")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "white",
          }}
        >
          <Brain size={14} /> Ask FinSight AI
        </button>
      </div>

      {!hasData ? (
        <div
          style={{
            padding: "60px 24px",
            background: "var(--card)",
            borderRadius: 14,
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
            No analytics yet
          </div>
          <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Add accounts and transactions to see your financial patterns here.
          </div>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }} className="responsive-grid-4">
            {[
              { label: "Avg Monthly Spend", value: `₹${fmt(data.avgMonthlySpend)}`, sub: "Last 6 months", icon: TrendingDown, color: "var(--negative)" },
              { label: "Avg Monthly Income", value: `₹${fmt(data.avgMonthlyIncome)}`, sub: "Last 6 months", icon: TrendingUp, color: "var(--positive)" },
              { label: "Avg Savings Rate", value: `${data.avgSavingsRatePct}%`, sub: "Last 6 months", icon: TrendingUp, color: "var(--primary)" },
              {
                label: "Largest Transaction",
                value: largest[0] ? `₹${fmt(largest[0].amount)}` : "—",
                sub: largest[0]?.merchant ?? "No expenses yet",
                icon: Zap,
                color: "var(--warning)",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ background: "var(--card)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {s.label}
                    </div>
                    <Icon size={14} color={s.color} />
                  </div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", marginBottom: 2 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{s.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Charts grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }} className="responsive-grid-2">
            <ChartCard title="Cash Flow — Income vs Expenses" action={<span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>6 months</span>}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.cashFlow} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Spending Breakdown">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={spendingPie} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                      {spendingPie.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                  {spendingPie.map((c) => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)", flex: 1 }}>{c.name}</span>
                      <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>
                        ₹{fmt(c.value.toFixed(2))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }} className="responsive-grid-2">
            <ChartCard title="Monthly Spending Trend">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data.monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} domain={["auto", "auto"]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="amount" name="Spending" stroke="#F43F5E" strokeWidth={2.5} dot={{ fill: "#F43F5E", r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Largest Transactions">
              {largest.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--muted-foreground)", textAlign: "center", padding: "20px 0" }}>
                  No expenses recorded yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {largest.map((t, i) => (
                    <div key={`${t.merchant}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: "var(--secondary)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted-foreground)",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.merchant}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.category}</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                        ₹{fmt(t.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
