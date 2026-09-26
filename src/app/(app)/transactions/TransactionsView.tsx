"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Grid3X3,
  List,
  InboxIcon,
} from "lucide-react";

import type { SerializedAccount, SerializedTransaction } from "@/lib/data/serialize";
import { AddTransactionButton } from "@/components/forms/TransactionForm";
import { TransactionRowActions } from "@/components/forms/TransactionRowActions";

const CATEGORIES = [
  "All",
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Education",
  "Subscriptions",
  "Salary",
  "Other",
];

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Food: "#F59E0B",
    Transport: "#8B5CF6",
    Shopping: "#EC4899",
    Entertainment: "#F43F5E",
    Bills: "#64748B",
    Education: "#0EA5E9",
    Subscriptions: "#6366F1",
    Salary: "#10B981",
    Other: "#64748B",
  };
  return map[cat] || "#64748B";
}

type SortBy = "date" | "amount";
type ViewMode = "categorized" | "raw";

export function TransactionsView({
  transactions,
  accounts,
}: {
  transactions: SerializedTransaction[];
  accounts: SerializedAccount[];
}) {
  const [view, setView] = useState<ViewMode>("categorized");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [accountFilter, setAccountFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          t.merchant.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q);
        const matchCat = selectedCat === "All" || t.category === selectedCat;
        const matchAccount = accountFilter === "All" || t.accountId === accountFilter;
        const matchType = typeFilter === "ALL" || t.type === typeFilter;
        return matchSearch && matchCat && matchAccount && matchType;
      })
      .sort((a, b) => {
        if (sortBy === "amount") return Number(b.amount) - Number(a.amount);
        return b.date.localeCompare(a.date);
      });
  }, [transactions, search, selectedCat, accountFilter, typeFilter, sortBy]);

  const grouped = useMemo(() => {
    return filtered.reduce(
      (acc, t) => {
        const key = t.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
      },
      {} as Record<string, SerializedTransaction[]>,
    );
  }, [filtered]);

  const total = useMemo(
    () =>
      filtered.reduce(
        (sum, t) => sum + (t.type === "INCOME" ? Number(t.amount) : -Number(t.amount)),
        0,
      ),
    [filtered],
  );

  const fmt = (s: string) =>
    Number(s).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const EmptyState = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        background: "var(--card)",
        borderRadius: 14,
        border: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <InboxIcon size={40} color="var(--muted-foreground)" style={{ marginBottom: 16, opacity: 0.5 }} />
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
        No transactions found
      </div>
      <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
        Try adjusting your search or filters.
      </div>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--foreground)",
    fontSize: 13,
    cursor: "pointer",
    outline: "none",
    fontFamily: "var(--font-body)",
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
            Transactions
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
            {filtered.length} transactions · Net {total >= 0 ? "+" : "−"}₹{fmt(Math.abs(total).toFixed(2))}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <AddTransactionButton accounts={accounts} />
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted-foreground)",
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            aria-label="Search transactions"
            style={{
              width: "100%",
              padding: "9px 14px 9px 36px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 13,
              color: "var(--foreground)",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          aria-pressed={showFilters}
          aria-label="Toggle category filters"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 14px",
            borderRadius: 8,
            background: showFilters ? "var(--primary)15" : "var(--card)",
            border: `1px solid ${showFilters ? "var(--primary)40" : "var(--border)"}`,
            cursor: "pointer",
            fontSize: 13,
            color: showFilters ? "var(--primary)" : "var(--foreground)",
          }}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          aria-label="Sort transactions"
          style={inputStyle}
        >
          <option value="date">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
        </select>
        {/* View toggle */}
        <div style={{ display: "flex", background: "var(--secondary)", borderRadius: 8, padding: 3, gap: 2 }} role="group" aria-label="View mode">
          <button
            onClick={() => setView("categorized")}
            aria-label="Categorized view"
            aria-pressed={view === "categorized"}
            style={{
              padding: "5px 10px",
              borderRadius: 5,
              border: view === "categorized" ? "1px solid var(--border)" : "1px solid transparent",
              background: view === "categorized" ? "var(--card)" : "none",
              cursor: "pointer",
              color: "var(--foreground)",
              display: "flex",
            }}
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => setView("raw")}
            aria-label="List view"
            aria-pressed={view === "raw"}
            style={{
              padding: "5px 10px",
              borderRadius: 5,
              border: view === "raw" ? "1px solid var(--border)" : "1px solid transparent",
              background: view === "raw" ? "var(--card)" : "none",
              cursor: "pointer",
              color: "var(--foreground)",
              display: "flex",
            }}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }} role="group" aria-label="Category filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                aria-pressed={selectedCat === cat}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  background: selectedCat === cat ? "var(--primary)" : "var(--card)",
                  border: `1px solid ${selectedCat === cat ? "var(--primary)" : "var(--border)"}`,
                  cursor: "pointer",
                  color: selectedCat === cat ? "white" : "var(--foreground)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              aria-label="Filter by account"
              style={inputStyle}
            >
              <option value="All">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              aria-label="Filter by type"
              style={inputStyle}
            >
              <option value="ALL">Income &amp; Expenses</option>
              <option value="INCOME">Income only</option>
              <option value="EXPENSE">Expenses only</option>
            </select>
          </div>
        </>
      )}

      {/* Empty state */}
      {filtered.length === 0 && <EmptyState />}

      {/* Categorized view */}
      {filtered.length > 0 && view === "categorized" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Object.entries(grouped).map(([cat, txns]) => {
            const catTotal = txns.reduce(
              (sum, t) => sum + (t.type === "INCOME" ? Number(t.amount) : -Number(t.amount)),
              0,
            );
            return (
              <div
                key={cat}
                style={{
                  background: "var(--card)",
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--secondary)",
                  }}
                  className="txn-cat-head"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: categoryColor(cat) }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{cat}</span>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{txns.length} transactions</span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono-data)",
                      fontSize: 14,
                      fontWeight: 700,
                      color: catTotal >= 0 ? "var(--positive)" : "var(--foreground)",
                    }}
                  >
                    {catTotal >= 0 ? "+" : "−"}₹{fmt(Math.abs(catTotal).toFixed(2))}
                  </span>
                </div>
                {txns.map((t, i) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 20px",
                      borderTop: i === 0 ? "none" : "1px solid var(--border)",
                    }}
                    className="txn-row"
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: t.type === "INCOME" ? "#10B98115" : "#F43F5E10",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {t.type === "INCOME" ? (
                        <ArrowUpRight size={15} color="var(--positive)" />
                      ) : (
                        <ArrowDownRight size={15} color="var(--negative)" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }} className="txn-info">
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{t.merchant}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }} className="txn-sub">
                        {t.accountName} · {t.date}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono-data)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: t.type === "INCOME" ? "var(--positive)" : "var(--foreground)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.type === "INCOME" ? "+" : "−"}₹{fmt(t.amount)}
                    </div>
                    <TransactionRowActions transaction={t} accounts={accounts} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Raw table view — wrapped for horizontal scroll on mobile */}
      {filtered.length > 0 && view === "raw" && (
        <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
                {["Date", "Description", "Merchant", "Category", "Account", "Type", "Amount", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--muted-foreground)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)", background: "var(--card)" }}>
                  <td style={{ padding: "11px 16px", fontFamily: "var(--font-mono-data)", fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                    {t.date}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--foreground)", maxWidth: 200 }}>
                    {t.description || "—"}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--foreground)", whiteSpace: "nowrap" }}>
                    {t.merchant}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        background: categoryColor(t.category) + "20",
                        color: categoryColor(t.category),
                      }}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                    {t.accountName}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        background: t.type === "INCOME" ? "#10B98115" : "#F43F5E15",
                        color: t.type === "INCOME" ? "var(--positive)" : "var(--negative)",
                        textTransform: "capitalize",
                      }}
                    >
                      {t.type.toLowerCase()}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono-data)",
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.type === "INCOME" ? "var(--positive)" : "var(--foreground)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.type === "INCOME" ? "+" : "−"}₹{fmt(t.amount)}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <TransactionRowActions transaction={t} accounts={accounts} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
