"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useUser } from "@/components/providers/UserProvider";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  LayoutDashboard,
  Plus,
  X,
  Brain,
  ChevronRight,
} from "lucide-react";

import type { DashboardData, SerializedBudget, SerializedGoal } from "@/lib/data/queries";

const PRESETS = ["Overview", "Spending", "Savings", "Minimal"];

const ALL_WIDGETS = [
  "Total Balance",
  "Income",
  "Expenses",
  "Savings Rate",
  "Cash Flow",
  "Spending Breakdown",
  "Budget Progress",
  "Recent Transactions",
  "Financial Goals",
  "AI Insights",
];

const DEFAULT_WIDGETS = [
  "Total Balance",
  "Income",
  "Expenses",
  "Savings Rate",
  "Cash Flow",
  "Spending Breakdown",
  "Budget Progress",
  "Recent Transactions",
  "Financial Goals",
  "AI Insights",
];

const PIE_COLORS = ["#6366F1", "#3B82F6", "#EC4899", "#F59E0B", "#64748B", "#10B981", "#8B5CF6"];

function StatCard({
  label,
  value,
  sub,
  color,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  trend?: "up" | "down";
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 14,
        padding: "20px 22px",
        border: "1px solid var(--border)",
        height: "100%",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--muted-foreground)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: color || "var(--foreground)",
          marginBottom: 6,
        }}
        className="stat-value"
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            color:
              trend === "up"
                ? "var(--positive)"
                : trend === "down"
                ? "var(--negative)"
                : "var(--muted-foreground)",
          }}
        >
          {trend === "up" && <ArrowUpRight size={13} />}
          {trend === "down" && <ArrowDownRight size={13} />}
          {sub}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
      }}
    >
      <div style={{ color: "var(--muted-foreground)", marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name as string} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: ₹{Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
};

function WidgetRemoveButton({ onRemove, widgetName }: { onRemove: () => void; widgetName: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 10,
        display: "flex",
        gap: 4,
      }}
    >
      <button
        onClick={onRemove}
        aria-label={`Remove ${widgetName} widget`}
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          background: "var(--negative)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={12} color="white" />
      </button>
    </div>
  );
}

/**
 * Time-of-day greeting used in the dashboard header.
 *
 * Computed with `useEffect`/`useState` so the server render and the first
 * client render agree ("Good day") — calling `new Date()` during render
 * would produce a hydration mismatch whenever the clock crossed AM/PM or
 * the server and browser sat in different timezones.
 */
function useTimeOfDayGreeting(): string {
  const [greeting, setGreeting] = useState("day");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "morning" : h < 18 ? "afternoon" : "evening");
  }, []);

  return greeting;
}

/** Today's date label, set after mount (locale-safe between SSR and client). */
function useTodayLabel(): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    );
  }, []);

  return label;
}

export function DashboardView({
  data,
  budgets,
  goals,
}: {
  data: DashboardData;
  budgets: SerializedBudget[];
  goals: SerializedGoal[];
}) {
  const user = useUser();
  const firstName = (user?.name ?? "there").split(/\s+/)[0] ?? "there";
  const router = useRouter();
  const greeting = useTimeOfDayGreeting();
  const todayLabel = useTodayLabel();
  const [preset, setPreset] = useState("Overview");
  const [activeWidgets, setActiveWidgets] = useState<string[]>(DEFAULT_WIDGETS);
  const [customizing, setCustomizing] = useState(false);

  const fmt = (s: string) =>
    Number(s).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt0 = (s: string) => Number(s).toLocaleString("en-US", { maximumFractionDigits: 0 });

  const savingsRate =
    Number(data.totalIncome) > 0
      ? ((Number(data.netSavings) / Number(data.totalIncome)) * 100).toFixed(1)
      : "0.0";

  const spendingPie = data.spendingByCategory.map((c, i) => ({
    name: c.category,
    value: Number(c.value),
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const budgetRows = budgets.flatMap((b) =>
    b.categories.map((c) => ({
      category: c.category,
      spent: Number(c.spent),
      budgeted: Number(c.allocatedAmount),
    })),
  );

  const removeWidget = (w: string) => setActiveWidgets((prev) => prev.filter((x) => x !== w));
  const addWidget = (w: string) => {
    if (!activeWidgets.includes(w)) setActiveWidgets((prev) => [...prev, w]);
  };

  const renderWidget = (name: string) => {
    const cardBase: React.CSSProperties = {
      background: "var(--card)",
      borderRadius: 14,
      border: "1px solid var(--border)",
      overflow: "hidden",
      position: "relative",
    };
    const header = (title: string, action?: React.ReactNode) => (
      <div
        style={{
          padding: "18px 20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.03em" }}>
          {title}
        </div>
        {action}
      </div>
    );

    switch (name) {
      case "Total Balance":
        return (
          <div style={{ ...cardBase, gridColumn: "span 2", padding: "20px 22px" }} className="widget-wide">
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted-foreground)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              TOTAL BALANCE
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
                marginBottom: 6,
              }}
              className="hero-value"
            >
              ₹{fmt(data.totalBalance)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <TrendingUp size={14} color="var(--positive)" />
              <span style={{ fontSize: 13, color: "var(--positive)", fontWeight: 600 }}>
                across {data.transactionCount.toLocaleString()} transactions
              </span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={data.monthlyCashFlow.map((m) => ({ month: m.month, v: Number(m.income) - Number(m.expenses) }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#6366F1" strokeWidth={2} fill="url(#nwGrad)" dot={false} />
                <Tooltip content={<CustomTooltip />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case "Income":
        return (
          <div style={cardBase}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            <StatCard label="Income" value={`₹${fmt(data.totalIncome)}`} sub="all time" color="var(--positive)" />
          </div>
        );
      case "Expenses":
        return (
          <div style={cardBase}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            <StatCard label="Expenses" value={`₹${fmt(data.totalExpenses)}`} sub="all time" trend="down" />
          </div>
        );
      case "Savings Rate":
        return (
          <div style={cardBase}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            <StatCard label="Net Savings" value={`₹${fmt(data.netSavings)}`} sub={`${savingsRate}% of income`} color="var(--primary)" />
          </div>
        );

      case "Cash Flow":
        return (
          <div style={{ ...cardBase, gridColumn: "span 2" }} className="widget-wide">
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            {header("Cash Flow", <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Last 6 months</span>)}
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.monthlyCashFlow} margin={{ top: 0, right: 20, bottom: 0, left: 20 }} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case "Spending Breakdown":
        return (
          <div style={{ ...cardBase }}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            {header("Spending")}
            <div style={{ padding: "0 20px 20px", display: "flex", gap: 16, alignItems: "center" }}>
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={spendingPie} cx="50%" cy="50%" innerRadius={30} outerRadius={48} dataKey="value" strokeWidth={0}>
                    {spendingPie.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {spendingPie.slice(0, 4).map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)", flex: 1 }}>{c.name}</span>
                    <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                      ₹{fmt0(c.value.toFixed(2))}
                    </span>
                  </div>
                ))}
                {spendingPie.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>No expenses yet</span>
                )}
              </div>
            </div>
          </div>
        );

      case "Budget Progress":
        return (
          <div style={{ ...cardBase }}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            {header(
              "Budgets",
              <button
                onClick={() => router.push("/budgets")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
                aria-label="View all budgets"
              >
                View all <ChevronRight size={12} />
              </button>
            )}
            <div style={{ padding: "0 20px 16px" }}>
              {budgetRows.slice(0, 5).map((b) => {
                const pct = b.budgeted > 0 ? Math.min(100, (b.spent / b.budgeted) * 100) : 0;
                const over = b.spent > b.budgeted;
                return (
                  <div key={b.category} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                        {b.category}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono-data)",
                          fontSize: 11,
                          color: over ? "var(--negative)" : "var(--muted-foreground)",
                        }}
                      >
                        ₹{fmt0(b.spent.toFixed(2))} / ₹{fmt0(b.budgeted.toFixed(2))}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "var(--secondary)", borderRadius: 2, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: over ? "var(--negative)" : pct > 80 ? "var(--warning)" : "var(--primary)",
                          borderRadius: 2,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {budgetRows.length === 0 && (
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>No budgets yet</span>
              )}
            </div>
          </div>
        );

      case "Recent Transactions":
        return (
          <div style={{ ...cardBase, gridColumn: "span 2" }} className="widget-wide">
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            {header(
              "Recent Transactions",
              <button
                onClick={() => router.push("/transactions")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
                aria-label="View all transactions"
              >
                View all <ChevronRight size={12} />
              </button>
            )}
            <div style={{ padding: "0 0 4px" }}>
              {data.recentTransactions.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      flexShrink: 0,
                      background: t.type === "INCOME" ? "#10B98115" : "#F43F5E15",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {t.type === "INCOME" ? (
                      <ArrowUpRight size={16} color="var(--positive)" />
                    ) : (
                      <ArrowDownRight size={16} color="var(--negative)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{t.merchant}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>
                      {t.category} · {t.date}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono-data)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.type === "INCOME" ? "var(--positive)" : "var(--foreground)",
                    }}
                  >
                    {t.type === "INCOME" ? "+" : "−"}₹{fmt(t.amount)}
                  </div>
                </div>
              ))}
              {data.recentTransactions.length === 0 && (
                <div style={{ padding: "12px 20px", fontSize: 13, color: "var(--muted-foreground)" }}>
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        );

      case "Financial Goals":
        return (
          <div style={{ ...cardBase, gridColumn: "span 2" }} className="widget-wide">
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            {header(
              "Goals",
              <button
                onClick={() => router.push("/goals")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
                aria-label="View all goals"
              >
                View all <ChevronRight size={12} />
              </button>
            )}
            <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
              className="responsive-grid-3">
              {goals.slice(0, 3).map((g, i) => (
                <div
                  key={g.id}
                  style={{
                    background: "var(--secondary)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      height: 4,
                      background: PIE_COLORS[i % PIE_COLORS.length],
                      borderRadius: 2,
                      width: 28,
                      marginBottom: 8,
                    }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                    {g.name}
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "var(--border)",
                      borderRadius: 2,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ height: "100%", width: `${g.progressPct}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 11, color: "var(--muted-foreground)" }}>
                      ₹{fmt0(g.currentAmount)}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 11, color: "var(--muted-foreground)" }}>
                      ₹{fmt0(g.targetAmount)}
                    </span>
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", gridColumn: "1 / -1" }}>
                  No goals yet
                </span>
              )}
            </div>
          </div>
        );

      case "AI Insights":
        return (
          <div style={{ ...cardBase, background: "linear-gradient(135deg, #6366F108, #8B5CF608)", gridColumn: "span 2" }} className="widget-wide">
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={14} color="white" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>AI Insights</span>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: "auto" }}>Updated now</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="responsive-grid-2">
                {[
                  overBudgetInsight(budgetRows),
                  topCategoryInsight(spendingPie),
                  savingsInsight(savingsRate, Number(data.netSavings)),
                  countInsight(data.transactionCount),
                ].map((insight, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--card)",
                      borderRadius: 9,
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{insight.icon}</span>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                      {insight.text}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push("/ai-assistant")}
                style={{
                  marginTop: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--primary)",
                  fontWeight: 500,
                }}
              >
                <Brain size={14} /> Ask FinSight AI
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }} className="responsive-padding">
      {/* Header */}
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
            Good {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
            {todayLabel} · Here&apos;s your financial overview
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Presets */}
          <div style={{ display: "flex", background: "var(--secondary)", borderRadius: 9, padding: 3, gap: 2 }} className="preset-row">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  background: preset === p ? "var(--card)" : "none",
                  border: preset === p ? "1px solid var(--border)" : "1px solid transparent",
                  cursor: "pointer",
                  color: preset === p ? "var(--foreground)" : "var(--muted-foreground)",
                }}
                aria-pressed={preset === p}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCustomizing(!customizing)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              background: customizing ? "var(--primary)" : "var(--card)",
              border: `1px solid ${customizing ? "var(--primary)" : "var(--border)"}`,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: customizing ? "white" : "var(--foreground)",
            }}
            aria-pressed={customizing}
          >
            <LayoutDashboard size={14} />
            {customizing ? "Done" : "Customize"}
          </button>
        </div>
      </div>

      {/* Widget picker */}
      {customizing && (
        <div
          style={{
            background: "var(--card)",
            borderRadius: 12,
            border: "1px solid var(--primary)40",
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginRight: 4 }}>
            Add widgets:
          </span>
          {ALL_WIDGETS.filter((w) => !activeWidgets.includes(w)).map((w) => (
            <button
              key={w}
              onClick={() => addWidget(w)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                background: "var(--secondary)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                color: "var(--foreground)",
              }}
              aria-label={`Add ${w} widget`}
            >
              <Plus size={11} /> {w}
            </button>
          ))}
          {ALL_WIDGETS.filter((w) => !activeWidgets.includes(w)).length === 0 && (
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>All widgets are active</span>
          )}
        </div>
      )}

      {/* Grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
        className="responsive-grid-4"
      >
        {activeWidgets.map((w) => (
          <div key={w} style={{ display: "contents" }}>
            {renderWidget(w)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple derived insights for the AI Insights widget (rule-based, no AI).
// ---------------------------------------------------------------------------

function overBudgetInsight(budgetRows: { category: string; spent: number; budgeted: number }[]) {
  const over = budgetRows.filter((b) => b.spent > b.budgeted);
  if (over.length === 0) return { icon: "✅", text: "All budget categories are within their limits." };
  const first = over[0];
  return {
    icon: "⚠️",
    text: `${first.category} is ₹${Math.round(first.spent - first.budgeted).toLocaleString()} over budget this month${over.length > 1 ? ` (+${over.length - 1} more)` : ""}`,
  };
}

function topCategoryInsight(spendingPie: { name: string; value: number }[]) {
  if (spendingPie.length === 0) return { icon: "💡", text: "Add transactions to unlock spending insights." };
  const top = [...spendingPie].sort((a, b) => b.value - a.value)[0];
  return { icon: "📈", text: `${top.name} is your largest spending category (₹${Math.round(top.value).toLocaleString()}).` };
}

function savingsInsight(rate: string, net: number) {
  if (net <= 0) return { icon: "⚠️", text: "Spending exceeds income — review your budget allocations." };
  return { icon: "🎯", text: `You're saving ${rate}% of your income (₹${Math.round(net).toLocaleString()} net).` };
}

function countInsight(count: number) {
  if (count === 0) return { icon: "💡", text: "Create an account and add your first transaction." };
  return { icon: "💡", text: `${count.toLocaleString()} transactions recorded so far.` };
}
