"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Lock,
  PieChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Customizable Dashboard",
    desc: "Build your own financial command center with a bento grid of widgets. Show exactly what matters to you.",
  },
  {
    icon: Brain,
    title: "AI Financial Assistant",
    desc: "Ask FinSight anything. Get personalized insights, spending analysis, and actionable advice in plain English.",
  },
  {
    icon: Target,
    title: "Smart Budgets & Goals",
    desc: "Set budgets by category, track progress visually, and stay aware before you overspend.",
  },
  {
    icon: TrendingUp,
    title: "Deep Analytics",
    desc: "Spot trends, compare months, and understand your financial patterns across multiple chart types.",
  },
  {
    icon: Zap,
    title: "Multi-Account View",
    desc: "See all your accounts — checking, savings, credit, and investments — unified in a single dashboard.",
  },
  {
    icon: Shield,
    title: "Privacy-Focused Architecture",
    desc: "Built with security in mind. Your data stays local during this demo — no third-party data sharing.",
  },
];

const stats = [
  { value: "Portfolio", label: "Project" },
  { value: "AI-Powered", label: "Finance" },
  { value: "5 Modules", label: "Dashboard, Budgets, Goals, Analytics, AI" },
  { value: "Full-Stack", label: "Next.js + TypeScript" },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      {/* Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border)",
          background: "var(--background)cc",
          backdropFilter: "blur(12px)",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
        className="responsive-padding"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PieChart size={16} color="white" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}
          >
            FinSight
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/login"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "none",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--foreground)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "var(--primary)",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "white",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "100px 48px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
        className="responsive-hero responsive-padding"
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 100,
              border: "1px solid #6366F140",
              background: "#6366F110",
              marginBottom: 24,
            }}
          >
            <Sparkles size={12} color="#6366F1" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6366F1", letterSpacing: "0.04em" }}>
              AI-POWERED FINANCE DEMO
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
              marginBottom: 20,
              margin: "0 0 20px",
            }}
          >
            Understand your money.
            <br />
            <span style={{ color: "#6366F1" }}>Make better decisions.</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "var(--muted-foreground)",
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 440,
            }}
          >
            FinSight brings all your accounts together, visualizes where your money goes, and gives you AI-powered guidance to reach your financial goals.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/register")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 24px",
                borderRadius: 10,
                background: "var(--primary)",
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                color: "white",
                boxShadow: "0 4px 20px #6366F140",
              }}
            >
              Explore the demo <ArrowRight size={16} />
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 24px",
                borderRadius: 10,
                background: "var(--card)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 500,
                color: "var(--foreground)",
              }}
            >
              View dashboard
            </button>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: 16,
            border: "1px solid var(--border)",
            padding: 24,
            boxShadow: "0 24px 60px #0000001a",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted-foreground)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              NET WORTH
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 36,
                fontWeight: 800,
                color: "var(--foreground)",
                letterSpacing: "-0.02em",
              }}
            >
              $124,760.62
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <TrendingUp size={14} color="#10B981" />
              <span style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}>+$660 this month</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Income", value: "$12,720", color: "#10B981" },
              { label: "Expenses", value: "$6,334", color: "#F43F5E" },
              { label: "Savings Rate", value: "50.2%", color: "#6366F1" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "var(--secondary)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 16, fontWeight: 600, color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 12,
              background: "var(--secondary)",
              borderRadius: 10,
              padding: "12px 14px",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "#6366F120",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={14} color="#6366F1" />
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.4 }}>
              <span style={{ color: "var(--foreground)", fontWeight: 500 }}>AI Insight:</span> Your dining spend is 17% above 3-month average. Consider cooking more this week.
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "40px 48px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 32,
          }}
          className="responsive-stats-4 responsive-padding"
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px" }} className="responsive-padding">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
              margin: "0 0 12px",
            }}
          >
            Everything you need to master your finances
          </h2>
          <p style={{ fontSize: 17, color: "var(--muted-foreground)", maxWidth: 480, margin: "0 auto" }}>
            A complete finance dashboard built to demonstrate modern full-stack patterns.
          </p>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}
          className="responsive-features-3"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                style={{
                  background: "var(--card)",
                  borderRadius: 14,
                  padding: 24,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#6366F115",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={20} color="#6366F1" />
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Section */}
      <section style={{ background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "80px 48px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
          className="responsive-hero responsive-padding"
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 100,
                border: "1px solid #8B5CF640",
                background: "#8B5CF610",
                marginBottom: 20,
              }}
            >
              <Sparkles size={12} color="#8B5CF6" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#8B5CF6", letterSpacing: "0.04em" }}>
                AI ASSISTANT
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--foreground)", margin: "0 0 16px" }}>
              Your personal financial advisor, always available
            </h2>
            <p style={{ fontSize: 16, color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: 24 }}>
              Ask anything about your finances. FinSight AI analyzes your data to give you personalized, actionable insights — not generic advice.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "Where did most of my money go?", a: "Housing ($2,100) was your largest expense, followed by groceries ($491) and shopping ($319)." },
              { q: "Am I on track with my budget?", a: "You're over budget in Shopping by $119. All other categories are within limits." },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: "var(--secondary)", borderRadius: 12, padding: 16, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ background: "var(--border)", borderRadius: 6, padding: "2px 8px", fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>You</div>
                  <div style={{ fontSize: 14, color: "var(--foreground)", fontWeight: 500 }}>{q}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ background: "#6366F120", borderRadius: 6, padding: "2px 8px", fontSize: 12, color: "#6366F1", fontWeight: 600, whiteSpace: "nowrap" }}>AI</div>
                  <div style={{ fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.5 }}>{a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px", textAlign: "center" }} className="responsive-padding">
        <Lock size={32} color="#6366F1" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--foreground)", margin: "0 0 12px" }}>
          Your privacy is non-negotiable
        </h2>
        <p style={{ fontSize: 16, color: "var(--muted-foreground)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Built with a privacy-first approach. This is a portfolio demo — no real financial data is stored or transmitted.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {["Open Source", "256-bit Encryption", "Privacy-Focused", "Read-Only Access"].map((badge) => (
            <div key={badge} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)" }}>
              <Shield size={14} color="#10B981" /> {badge}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1, #8B5CF6)", padding: "80px 48px", textAlign: "center" }} className="responsive-padding">
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", color: "white", margin: "0 0 16px" }}>
          Explore the full dashboard
        </h2>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", marginBottom: 32 }}>
          Portfolio demo — all features available, no sign-up required.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "16px 32px",
            borderRadius: 12,
            background: "white",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
            color: "#4F46E5",
          }}
        >
          View demo dashboard <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--card)", borderTop: "1px solid var(--border)", padding: "32px 48px" }} className="responsive-padding">
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PieChart size={16} color="#6366F1" />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--muted-foreground)" }}>FinSight</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>© 2026 FinSight — Portfolio Project</div>
          <div style={{ display: "flex", gap: 24 }}>
            {["GitHub", "Portfolio"].map((l) => (
              <span key={l} style={{ fontSize: 13, color: "var(--muted-foreground)", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
