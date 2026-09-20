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
import { Brain, TrendingUp, TrendingDown, Zap } from "lucide-react";
import {
  cashFlowData,
  spendingByCategory,
  monthlySpendingTrend,
  netWorthHistory,
} from "@/lib/data/mockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--muted-foreground)", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || p.stroke, fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

const categoryComparison = [
  { month: "Apr", groceries: 520, dining: 310, transport: 190 },
  { month: "May", groceries: 480, dining: 270, transport: 160 },
  { month: "Jun", groceries: 610, dining: 340, transport: 220 },
  { month: "Jul", groceries: 440, dining: 260, transport: 130 },
  { month: "Aug", groceries: 510, dining: 295, transport: 175 },
  { month: "Sep", groceries: 491, dining: 284, transport: 148 },
];

const largestTransactions = [
  { name: "Chase Mortgage", amount: 2100, category: "Housing" },
  { name: "Airbnb weekend stay", amount: 312, category: "Travel" },
  { name: "Amazon Prime", amount: 139, category: "Shopping" },
  { name: "Whole Foods", amount: 127, category: "Groceries" },
  { name: "Equinox Fitness", amount: 85, category: "Health" },
];

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

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
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

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Avg Monthly Spend", value: "$6,373", sub: "Last 6 months", icon: TrendingDown, color: "var(--negative)" },
          { label: "Avg Monthly Income", value: "$10,853", sub: "Last 6 months", icon: TrendingUp, color: "var(--positive)" },
          { label: "Avg Savings Rate", value: "41.3%", sub: "Last 6 months", icon: TrendingUp, color: "var(--primary)" },
          { label: "Largest Transaction", value: "$2,100", sub: "Chase Mortgage", icon: Zap, color: "var(--warning)" },
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
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartCard title="Cash Flow — Income vs Expenses" action={<span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>6 months</span>}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cashFlowData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Spending Breakdown" action={<span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Sep 2026</span>}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                  {spendingByCategory.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
              {spendingByCategory.map((c) => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)", flex: 1 }}>{c.name}</span>
                  <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>${c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartCard title="Net Worth Trend">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={netWorthHistory}>
              <defs>
                <linearGradient id="nwAnalyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#6366F1" strokeWidth={2.5} fill="url(#nwAnalyticsGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Spending Trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlySpendingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" name="Spending" stroke="#F43F5E" strokeWidth={2.5} dot={{ fill: "#F43F5E", r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <ChartCard title="Category Spending Comparison">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryComparison} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Bar dataKey="groceries" name="Groceries" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="dining" name="Dining" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="transport" name="Transport" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Largest Transactions">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {largestTransactions.map((t, i) => (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.category}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                  ${t.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
