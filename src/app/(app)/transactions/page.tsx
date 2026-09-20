"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Grid3X3,
  List,
} from "lucide-react";
import { transactions } from "@/lib/data/mockData";

const CATEGORIES = [
  "All",
  "Income",
  "Groceries",
  "Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Health",
  "Software",
  "Utilities",
  "Travel",
  "Housing",
  "Investments",
];

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Income: "#10B981",
    Groceries: "#3B82F6",
    Dining: "#F59E0B",
    Transportation: "#8B5CF6",
    Entertainment: "#F43F5E",
    Shopping: "#EC4899",
    Health: "#10B981",
    Software: "#6366F1",
    Utilities: "#64748B",
    Travel: "#0EA5E9",
    Housing: "#6366F1",
    Investments: "#10B981",
  };
  return map[cat] || "#64748B";
}

export default function TransactionsPage() {
  const [view, setView] = useState<"categorized" | "raw">("categorized");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = transactions
    .filter((t) => {
      const matchSearch =
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === "All" || t.category === selectedCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "amount") return Math.abs(b.amount) - Math.abs(a.amount);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const grouped = filtered.reduce((acc, t) => {
    const key = t.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, typeof transactions>);

  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
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
            Transactions
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
            {filtered.length} transactions · Net {total >= 0 ? "+" : ""}${total.toFixed(2)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
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
              color: "var(--foreground)",
            }}
          >
            <Upload size={14} /> Import CSV
          </button>
          <button
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
            <Plus size={14} /> Add Transaction
          </button>
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
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
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
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
            fontSize: 13,
            cursor: "pointer",
            outline: "none",
            fontFamily: "var(--font-body)",
          }}
        >
          <option value="date">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
        </select>
        {/* View toggle */}
        <div style={{ display: "flex", background: "var(--secondary)", borderRadius: 8, padding: 3, gap: 2 }}>
          <button
            onClick={() => setView("categorized")}
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

      {/* Category filter chips */}
      {showFilters && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
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
      )}

      {view === "categorized" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Object.entries(grouped).map(([cat, txns]) => {
            const catTotal = txns.reduce((sum, t) => sum + t.amount, 0);
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
                    {catTotal >= 0 ? "+" : ""}${catTotal.toFixed(2)}
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
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: t.type === "income" ? "#10B98115" : "#F43F5E10",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {t.type === "income" ? (
                        <ArrowUpRight size={15} color="var(--positive)" />
                      ) : (
                        <ArrowDownRight size={15} color="var(--negative)" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{t.merchant}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.account}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
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
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
                {["Date", "Description", "Merchant", "Category", "Account", "Type", "Amount"].map((h) => (
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
                <tr key={t.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                  <td style={{ padding: "11px 16px", fontFamily: "var(--font-mono-data)", fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                    {t.date}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--foreground)", maxWidth: 200 }}>
                    {t.description}
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
                    {t.account}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        background: t.type === "income" ? "#10B98115" : "#F43F5E15",
                        color: t.type === "income" ? "var(--positive)" : "var(--negative)",
                        textTransform: "capitalize",
                      }}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono-data)",
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.type === "income" ? "var(--positive)" : "var(--foreground)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                    </span>
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
