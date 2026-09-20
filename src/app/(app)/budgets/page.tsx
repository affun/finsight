"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertTriangle, Brain } from "lucide-react";
import { budgets } from "@/lib/data/mockData";

export default function BudgetsPage() {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const totalBudgeted = budgets.reduce((s, b) => s + b.budgeted, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudgeted - totalSpent;
  const overBudget = budgets.filter((b) => b.spent > b.budgeted);

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
            Budgets
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>September 2026</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/ai-assistant")}
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
            }}
          >
            <Brain size={14} color="#8B5CF6" /> Ask FinSight
          </button>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: "var(--primary)",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "white",
            }}
          >
            <Plus size={14} /> Create Budget
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Budget", value: `$${totalBudgeted.toLocaleString()}`, color: "var(--foreground)" },
          { label: "Total Spent", value: `$${totalSpent.toLocaleString()}`, color: totalSpent > totalBudgeted ? "var(--negative)" : "var(--foreground)" },
          { label: "Remaining", value: `$${remaining.toLocaleString()}`, color: remaining < 0 ? "var(--negative)" : "var(--positive)" },
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
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Monthly Overview</span>
          <span style={{ fontSize: 13, color: "var(--muted-foreground)", fontFamily: "var(--font-mono-data)" }}>
            ${totalSpent.toLocaleString()} / ${totalBudgeted.toLocaleString()}
          </span>
        </div>
        <div style={{ height: 8, background: "var(--secondary)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, (totalSpent / totalBudgeted) * 100)}%`,
              background: totalSpent > totalBudgeted ? "var(--negative)" : "var(--primary)",
              borderRadius: 4,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {((totalSpent / totalBudgeted) * 100).toFixed(1)}% of monthly budget used
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
        >
          <AlertTriangle size={16} color="var(--negative)" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--negative)", marginBottom: 4 }}>
              Over budget in {overBudget.length} {overBudget.length === 1 ? "category" : "categories"}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {overBudget.map((b) => `${b.icon} ${b.category} (+$${(b.spent - b.budgeted).toFixed(0)} over)`).join(" · ")}
            </div>
          </div>
        </div>
      )}

      {/* Budget categories */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {budgets.map((b) => {
          const pct = Math.min(100, (b.spent / b.budgeted) * 100);
          const over = b.spent > b.budgeted;
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
                  <span style={{ fontSize: 22 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{b.category}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--font-mono-data)" }}>
                      ${b.spent.toLocaleString()} / ${b.budgeted.toLocaleString()}
                    </div>
                  </div>
                </div>
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
                    +${(b.spent - b.budgeted).toFixed(0)} over
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
                    ${(b.budgeted - b.spent).toFixed(0)} left
                  </span>
                )}
              </div>
              <div style={{ height: 6, background: "var(--secondary)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{pct.toFixed(0)}% used</span>
                <span style={{ fontSize: 11, color: barColor, fontWeight: 600 }}>
                  {over ? "OVER BUDGET" : pct > 80 ? "CLOSE TO LIMIT" : "ON TRACK"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
