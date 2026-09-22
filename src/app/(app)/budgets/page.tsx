import { Plus, AlertTriangle, Brain } from "lucide-react";

import { getBudgetsWithSpending } from "@/lib/data/queries";
import { AddBudgetButton, BudgetCardActions } from "@/components/forms/BudgetForm";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍽️",
  Transport: "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Bills: "⚡",
  Education: "📚",
  Subscriptions: "📺",
  Other: "📦",
};

export default async function BudgetsPage() {
  const budgets = await getBudgetsWithSpending();

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.totalAllocated), 0);
  const totalSpent = budgets.reduce(
    (s, b) => s + b.categories.reduce((cs, c) => cs + Number(c.spent), 0),
    0,
  );
  const remaining = totalBudgeted - totalSpent;
  const overBudget = budgets.flatMap((b) =>
    b.categories
      .filter((c) => Number(c.spent) > Number(c.allocatedAmount))
      .map((c) => ({ category: c.category, icon: CATEGORY_ICONS[c.category] ?? "📦", over: Number(c.spent) - Number(c.allocatedAmount) })),
  );

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

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
            Budgets
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
            {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/ai-assistant"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              background: "var(--card)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--muted-foreground)",
              textDecoration: "none",
            }}
          >
            <Brain size={14} color="#8B5CF6" /> Ask FinSight
          </Link>
          <AddBudgetButton />
        </div>
      </div>

      {budgets.length === 0 ? (
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
            No budgets yet
          </div>
          <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Create a budget to track spending against category limits.
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }} className="responsive-grid-3">
            {[
              { label: "Total Budget", value: `₹${fmt(totalBudgeted)}`, color: "var(--foreground)" },
              { label: "Total Spent", value: `₹${fmt(totalSpent)}`, color: totalSpent > totalBudgeted ? "var(--negative)" : "var(--foreground)" },
              { label: "Remaining", value: `₹${fmt(remaining)}`, color: remaining < 0 ? "var(--negative)" : "var(--positive)" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--card)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Overall progress bar */}
          <div style={{ background: "var(--card)", borderRadius: 12, padding: "20px 24px", border: "1px solid var(--border)", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Overall Usage</span>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)", fontFamily: "var(--font-mono-data)" }}>
                ₹{fmt(totalSpent)} / ₹{fmt(totalBudgeted)}
              </span>
            </div>
            <div style={{ height: 8, background: "var(--secondary)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div
                style={{
                  height: "100%",
                  width: `${totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100) : 0}%`,
                  background: totalSpent > totalBudgeted ? "var(--negative)" : "var(--primary)",
                  borderRadius: 4,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : "0.0"}% of budgeted amount used
            </div>
          </div>

          {/* Over budget warning */}
          {overBudget.length > 0 && (
            <div
              style={{
                background: "#F43F5E10",
                border: "1px solid #F43F5E30",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 20,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
              role="alert"
            >
              <AlertTriangle size={16} color="var(--negative)" style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--negative)", marginBottom: 4 }}>
                  Over budget in {overBudget.length} {overBudget.length === 1 ? "category" : "categories"}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  {overBudget.map((b) => `${b.icon} ${b.category} (+₹${fmt(b.over)} over)`).join(" · ")}
                </div>
              </div>
            </div>
          )}

          {/* Budget category cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="responsive-grid-2">
            {budgets.map((b) => {
              const budgeted = Number(b.totalAllocated);
              const spent = b.categories.reduce((s, c) => s + Number(c.spent), 0);
              const pct = budgeted > 0 ? Math.min(100, (spent / budgeted) * 100) : 0;
              const over = spent > budgeted;
              const barColor = over ? "var(--negative)" : pct > 80 ? "var(--warning)" : "var(--positive)";

              return (
                <div
                  key={b.id}
                  style={{
                    background: "var(--card)",
                    borderRadius: 12,
                    padding: "20px 22px",
                    border: `1px solid ${over ? "#F43F5E30" : "var(--border)"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{CATEGORY_ICONS[b.categories[0]?.category ?? "Other"] ?? "📦"}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--font-mono-data)" }}>
                          ₹{fmt(spent)} / ₹{fmt(budgeted)} · {b.period.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {over ? (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            background: "#F43F5E20",
                            color: "var(--negative)",
                          }}
                        >
                          +₹{fmt(spent - budgeted)} over
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            background: "var(--secondary)",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          ₹{fmt(budgeted - spent)} left
                        </span>
                      )}
                      <BudgetCardActions
                        budget={{
                          id: b.id,
                          name: b.name,
                          amount: b.amount,
                          period: b.period,
                          startDate: b.startDate,
                          endDate: b.endDate,
                          categories: b.categories.map((c) => ({ category: c.category, allocatedAmount: c.allocatedAmount })),
                        }}
                      />
                    </div>
                  </div>

                  {/* Per-category breakdown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {b.categories.map((c) => {
                      const alloc = Number(c.allocatedAmount);
                      const catSpent = Number(c.spent);
                      const catPct = alloc > 0 ? Math.min(100, (catSpent / alloc) * 100) : 0;
                      const catOver = catSpent > alloc;
                      return (
                        <div key={c.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "var(--foreground)" }}>
                              {CATEGORY_ICONS[c.category] ?? "📦"} {c.category}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-mono-data)",
                                fontSize: 11,
                                color: catOver ? "var(--negative)" : "var(--muted-foreground)",
                              }}
                            >
                              ₹{fmt(catSpent)} / ₹{fmt(alloc)}
                            </span>
                          </div>
                          <div style={{ height: 5, background: "var(--secondary)", borderRadius: 3, overflow: "hidden" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${catPct}%`,
                                background: catOver ? "var(--negative)" : catPct > 80 ? "var(--warning)" : "var(--primary)",
                                borderRadius: 3,
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{pct.toFixed(0)}% used</span>
                    <span style={{ fontSize: 11, color: barColor, fontWeight: 600 }}>
                      {over ? "OVER BUDGET" : pct > 80 ? "CLOSE TO LIMIT" : "ON TRACK"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
