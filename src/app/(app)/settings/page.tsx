"use client";

import { useState } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  Trash2,
  Bell,
  Shield,
  User,
  Globe,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--muted-foreground)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div style={{ background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  desc,
  children,
  danger,
}: {
  icon: any;
  label: string;
  desc?: string;
  children?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          flexShrink: 0,
          background: danger ? "#F43F5E15" : "var(--secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} color={danger ? "var(--negative)" : "var(--muted-foreground)"} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: danger ? "var(--negative)" : "var(--foreground)" }}>
          {label}
        </div>
        {desc && <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: checked ? "var(--primary)" : "var(--secondary)",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
        outline: "none",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState("USD");
  const [notifications, setNotifications] = useState({
    budget: true,
    goals: true,
    weekly: false,
    anomaly: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
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
          Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            AJ
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>
              Alex Johnson
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>alex@example.com</div>
          </div>
          <button
            style={{
              padding: "7px 14px",
              borderRadius: 7,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--foreground)",
            }}
          >
            Edit profile
          </button>
        </div>
        <Row icon={User} label="Full name" desc="Alex Johnson">
          <input
            defaultValue="Alex Johnson"
            style={{
              padding: "7px 12px",
              borderRadius: 7,
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              color: "var(--foreground)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              outline: "none",
              width: 180,
            }}
          />
        </Row>
        <div style={{ borderBottom: 0 }}>
          <Row icon={Globe} label="Email" desc="alex@example.com">
            <input
              defaultValue="alex@example.com"
              style={{
                padding: "7px 12px",
                borderRadius: 7,
                border: "1px solid var(--border)",
                background: "var(--secondary)",
                color: "var(--foreground)",
                fontSize: 13,
                fontFamily: "var(--font-body)",
                outline: "none",
                width: 200,
              }}
            />
          </Row>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", marginBottom: 12 }}>Theme</div>
          <div style={{ display: "flex", gap: 10 }}>
            {(["light", "dark", "system"] as const).map((t) => {
              const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 9,
                    background: theme === t ? "#6366F115" : "var(--secondary)",
                    border: `1px solid ${theme === t ? "var(--primary)" : "var(--border)"}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon size={18} color={theme === t ? "var(--primary)" : "var(--muted-foreground)"} />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: theme === t ? "var(--primary)" : "var(--muted-foreground)",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <Row icon={Globe} label="Currency" desc="Primary display currency">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: 7,
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              color: "var(--foreground)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="JPY">JPY — Japanese Yen</option>
          </select>
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        {(
          [
            { key: "budget", label: "Budget alerts", desc: "Get notified when you approach or exceed budget limits" },
            { key: "goals", label: "Goal milestones", desc: "Celebrate progress on your financial goals" },
            { key: "weekly", label: "Weekly summary", desc: "Receive a weekly digest of your finances" },
            { key: "anomaly", label: "Spending anomalies", desc: "AI alerts for unusual spending patterns" },
          ] as const
        ).map((item) => (
          <Row key={item.key} icon={Bell} label={item.label} desc={item.desc}>
            <Toggle checked={notifications[item.key]} onChange={() => toggleNotification(item.key)} />
          </Row>
        ))}
      </Section>

      {/* Data */}
      <Section title="Data & Privacy">
        <Row icon={Download} label="Export data" desc="Download all your financial data as CSV">
          <button
            style={{
              padding: "7px 14px",
              borderRadius: 7,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--foreground)",
            }}
          >
            Export
          </button>
        </Row>
        <Row icon={Upload} label="Import data" desc="Import transactions from CSV or other apps">
          <button
            style={{
              padding: "7px 14px",
              borderRadius: 7,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--foreground)",
            }}
          >
            Import
          </button>
        </Row>
        <Row icon={Shield} label="Security" desc="Two-factor authentication is enabled" />
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <Row icon={Trash2} label="Delete account" desc="Permanently delete your FinSight account and all data" danger>
          <button
            style={{
              padding: "7px 14px",
              borderRadius: 7,
              background: "#F43F5E15",
              border: "1px solid #F43F5E40",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--negative)",
              fontWeight: 600,
            }}
          >
            Delete
          </button>
        </Row>
      </Section>
    </div>
  );
}
