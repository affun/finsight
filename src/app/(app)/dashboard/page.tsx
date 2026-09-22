"use client";

import { useState } from "react";
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
import {
  cashFlowData,
  spendingByCategory,
  netWorthHistory,
  budgets,
  goals,
  transactions,
} from "@/lib/data/mockData";

const PRESETS = ["Overview", "Spending", "Savings", "Minimal"];

const ALL_WIDGETS = [
  "Net Worth",
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
  "Quick AI",
];

const DEFAULT_WIDGETS = [
  "Net Worth",
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
          {p.name}: ${(p.value as number).toLocaleString()}
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

/** Time-of-day greeting used in the dashboard header. */
function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  const user = useUser();
  const firstName = (user?.name ?? "there").split(/\s+/)[0] ?? "there";
  const router = useRouter();
  const [preset, setPreset] = useState("Overview");
  const [activeWidgets, setActiveWidgets] = useState<string[]>(DEFAULT_WIDGETS);
  const [customizing, setCustomizing] = useState(false);

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
      case "Net Worth":
        return (
          <div style={{ ...cardBase, gridColumn: "span 2", padding: "20px 22px" }}>
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
              NET WORTH
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
            >
              ${netWorthHistory[netWorthHistory.length - 1].netWorth.toLocaleString()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <TrendingUp size={14} color="var(--positive)" />
              <span style={{ fontSize: 13, color: "var(--positive)", fontWeight: 600 }}>
                +$660.00 (0.53%) this month
              </span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={netWorthHistory} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="netWorth" stroke="#6366F1" strokeWidth={2} fill="url(#nwGrad)" dot={false} />
                <Tooltip content={<CustomTooltip />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case "Income":
        return (
          <div style={cardBase}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            <StatCard label="Income" value="$12,720" sub="+12% vs last month" trend="up" color="var(--positive)" />
          </div>
        );
      case "Expenses":
        return (
          <div style={cardBase}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            {/* Expenses decreased by 3% — trend="down" means down arrow, indicating reduction */}
            <StatCard label="Expenses" value="$6,334" sub="-3% vs last month" trend="down" />
          </div>
        );
      case "Savings Rate":
        return (
          <div style={cardBase}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            <StatCard label="Savings Rate" value="50.2%" sub="+2.1pp vs last month" trend="up" color="var(--primary)" />
          </div>
        );

      case "Cash Flow":
        return (
          <div style={{ ...cardBase, gridColumn: "span 2" }}>
            {customizing && <WidgetRemoveButton onRemove={() => removeWidget(name)} widgetName={name} />}
            {header("Cash Flow", <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Last 6 months</span>)}
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={cashFlowData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }} barGap={4}>
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
                  <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={30} outerRadius={48} dataKey="value" strokeWidth={0}>
                    {spendingByCategory.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {spendingByCategory.slice(0, 4).map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)", flex: 1 }}>{c.name}</span>
                    <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                      ${c.value}
                    </span>
                  </div>
                ))}
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
              {budgets.slice(0, 5).map((b) => {
                const pct = Math.min(100, (b.spent / b.budgeted) * 100);
                const over = b.spent > b.budgeted;
                return (
                  <div key={b.category} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                        {b.icon} {b.category}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono-data)",
                          fontSize: 11,
                          color: over ? "var(--negative)" : "var(--muted-foreground)",
                        }}
                      >
                        ${b.spent} / ${b.budgeted}
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
            </div>
          </div>
        );

      case "Recent Transactions":
        return (
          <div style={{ ...cardBase, gridColumn: "span 2" }}>
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
              {transactions.slice(0, 6).map((t, i) => (
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
                      background: t.type === "income" ? "#10B98115" : "#F43F5E15",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {t.type === "income" ? (
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
                      color: t.type === "income" ? "var(--positive)" : "var(--foreground)",
                    }}
                  >
                    {t.type === "income" ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "Financial Goals":
        return (
          <div style={{ ...cardBase, gridColumn: "span 2" }}>
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
              {goals.slice(0, 3).map((g) => {
                const pct = (g.current / g.target) * 100;
                return (
                  <div
                    key={g.id}
                    style={{
                      background: "var(--secondary)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{g.icon}</div>
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
                      <div style={{ height: "100%", width: `${pct}%`, background: g.color, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 11, color: "var(--muted-foreground)" }}>
                        ${g.current.toLocaleString()}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 11, color: "var(--muted-foreground)" }}>
                        ${g.target.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "AI Insights":
        return (
          <div style={{ ...cardBase, background: "linear-gradient(135deg, #6366F108, #8B5CF608)", gridColumn: "span 2" }}>
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
                  { icon: "⚠️", text: "Shopping is $119 over budget this month", type: "warning" },
                  { icon: "🎯", text: "On track to hit Japan trip goal by June 2027", type: "positive" },
                  { icon: "📈", text: "Savings rate up 2.1pp — best month this year", type: "positive" },
                  { icon: "💡", text: "Dining avg 17% above 3-month trend. Review?", type: "info" },
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
            Good {timeOfDayGreeting()}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
            Thursday, September 20, 2026 · Here&apos;s your financial overview
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Presets */}
          <div style={{ display: "flex", background: "var(--secondary)", borderRadius: 9, padding: 3, gap: 2 }}>
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
