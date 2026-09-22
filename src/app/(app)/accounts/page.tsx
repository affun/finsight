"use client";

import { CreditCard, Building2, TrendingUp, Wallet, Plus } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { accounts, transactions } from "@/lib/data/mockData";

const balanceHistory = [
  [12000, 11800, 12400, 12100, 12900, 12840],
  [27000, 27500, 28000, 28200, 28400, 28500],
  [-800, -1100, -900, -1300, -1200, -1240],
  [78000, 80000, 81000, 83000, 84000, 84320],
  [320, 340, 290, 350, 340, 340],
];

function accountIcon(type: string) {
  switch (type) {
    case "checking":
      return Building2;
    case "savings":
      return Wallet;
    case "credit":
      return CreditCard;
    case "investment":
      return TrendingUp;
    default:
      return Wallet;
  }
}

function accountTypeLabel(type: string) {
  const m: Record<string, string> = {
    checking: "Checking Account",
    savings: "Savings Account",
    credit: "Credit Card",
    investment: "Brokerage",
    cash: "Cash",
  };
  return m[type] || type;
}

export default function AccountsPage() {
  const totalAssets = accounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0);
  const netWorth = totalAssets + totalLiabilities;

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
            Accounts
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
            All your financial accounts in one place
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            borderRadius: 8,
            background: "var(--primary)",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "white",
          }}
        >
          <Plus size={14} /> Add Account
        </button>
      </div>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Assets", value: `$${totalAssets.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "var(--positive)" },
          { label: "Total Liabilities", value: `-$${Math.abs(totalLiabilities).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "var(--negative)" },
          { label: "Net Worth", value: `$${netWorth.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "var(--primary)" },
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

      {/* Account cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="responsive-grid-2">
        {accounts.map((account, idx) => {
          const Icon = accountIcon(account.type);
          const recentTxns = transactions.filter((t) => t.account === account.name).slice(0, 3);
          const sparkData = balanceHistory[idx].map((v, i) => ({ v, i }));
          const isNegative = account.balance < 0;

          return (
            <div
              key={account.id}
              style={{
                background: "var(--card)",
                borderRadius: 16,
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "20px 24px",
                  background: `linear-gradient(135deg, ${account.color}20, ${account.color}08)`,
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        background: account.color + "25",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} color={account.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{account.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        {accountTypeLabel(account.type)} {account.last4 ? `···· ${account.last4}` : ""}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 30,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: isNegative ? "var(--negative)" : "var(--foreground)",
                    }}
                  >
                    {isNegative ? "-" : ""}${Math.abs(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                    {account.currency} · {account.institution}
                  </div>
                </div>
                <div style={{ width: 100, height: 50 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id={`grad${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={account.color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={account.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={account.color} strokeWidth={2} fill={`url(#grad${idx})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent transactions */}
              <div style={{ padding: "12px 0" }}>
                <div style={{ padding: "0 20px 8px", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Recent
                </div>
                {recentTxns.length > 0 ? (
                  recentTxns.map((t, i) => (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 20px",
                        borderTop: i === 0 ? "1px solid var(--border)" : "1px solid var(--border)",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{t.merchant}</div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.date}</div>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono-data)",
                          fontSize: 13,
                          fontWeight: 600,
                          color: t.type === "income" ? "var(--positive)" : "var(--foreground)",
                        }}
                      >
                        {t.type === "income" ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "12px 20px", fontSize: 13, color: "var(--muted-foreground)" }}>No recent transactions</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
