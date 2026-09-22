import { CreditCard, Building2, TrendingUp, Wallet } from "lucide-react";

import { getAccountSummary, getAccounts } from "@/lib/data/queries";
import { AddAccountButton, AccountActions } from "@/components/forms/AccountForm";
import { AccountSparkline } from "./AccountSparkline";

function accountIcon(type: string) {
  switch (type) {
    case "BANK":
      return Building2;
    case "CASH":
      return Wallet;
    case "CREDIT_CARD":
      return CreditCard;
    case "INVESTMENT":
      return TrendingUp;
    default:
      return Wallet;
  }
}

function accountTypeLabel(type: string) {
  const m: Record<string, string> = {
    BANK: "Bank Account",
    CASH: "Cash",
    CREDIT_CARD: "Credit Card",
    INVESTMENT: "Investment",
    OTHER: "Other",
  };
  return m[type] || type;
}

/** Deterministic per-account accent + sparkline colors (palette preserved). */
const CARD_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#6366F1", "#64748B", "#EC4899"];
function cardColor(idx: number) {
  return CARD_COLORS[idx % CARD_COLORS.length];
}

export default async function AccountsPage() {
  const [accounts, summary] = await Promise.all([getAccounts(), getAccountSummary()]);

  const fmt = (s: string) =>
    Number(s).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
        <AddAccountButton />
      </div>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Assets", value: `₹${fmt(summary.totalAssets)}`, color: "var(--positive)" },
          { label: "Total Liabilities", value: `-₹${fmt(summary.totalLiabilities)}`, color: "var(--negative)" },
          { label: "Net Worth", value: `₹${fmt(summary.netWorth)}`, color: "var(--primary)" },
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
          const color = cardColor(idx);
          const isNegative = Number(account.balance) < 0;

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
                  background: `linear-gradient(135deg, ${color}20, ${color}08)`,
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
                        background: color + "25",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{account.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        {accountTypeLabel(account.type)}
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
                    {isNegative ? "-" : ""}₹{fmt(account.balance.replace("-", ""))}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                    {account.currency} · {account.transactionCount} transaction{account.transactionCount === 1 ? "" : "s"}
                  </div>
                </div>
                <AccountSparkline color={color} seedValue={Number(account.balance)} />
              </div>

              {/* Card footer — actions */}
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <AccountActions account={account} />
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && (
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
            No accounts yet
          </div>
          <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Create your first account to start tracking transactions.
          </div>
        </div>
      )}
    </div>
  );
}
