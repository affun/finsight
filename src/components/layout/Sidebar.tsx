"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Target,
  BarChart3,
  Sparkles,
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUser } from "@/components/providers/UserProvider";
import { getInitials } from "@/lib/initials";
import { logoutAction } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-assistant", label: "AI Assistant", icon: Sparkles, isAi: true },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeTheme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useUser();
  const displayName = user?.name ?? "Guest";
  const initials = getInitials(displayName);

  return (
    <>
      {/* Mobile Top Bar */}
      <div
        className="lg:hidden"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
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

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--foreground)",
            padding: 4,
          }}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 45,
            backdropFilter: "blur(4px)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:transition-transform max-lg:duration-[250ms] max-lg:ease-in-out`}
        style={{
          width: 260,
          height: "100vh",
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 50,
        }}
        aria-label="Main navigation"
      >
        {/* Header / Logo */}
        <div
          style={{
            padding: "24px 24px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PieChart size={18} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: 19,
                  letterSpacing: "-0.02em",
                  color: "var(--foreground)",
                  lineHeight: 1,
                }}
              >
                FinSight
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  marginTop: 3,
                }}
              >
                Finance Intelligence
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px 8px",
            }}
          >
            Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? item.isAi
                      ? "#8B5CF6"
                      : "var(--foreground)"
                    : "var(--muted-foreground)",
                  background: isActive
                    ? item.isAi
                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12))"
                      : "var(--secondary)"
                    : "transparent",
                  border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isActive
                      ? item.isAi
                        ? "#8B5CF6"
                        : "var(--primary)"
                      : "var(--muted-foreground)",
                  }}
                >
                  <Icon size={18} />
                </div>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.isAi && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 100,
                      background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                      color: "white",
                    }}
                  >
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Theme & Profile */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 14px",
              borderRadius: 10,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              color: "var(--foreground)",
              fontSize: 13,
              fontWeight: 500,
              width: "100%",
            }}
            aria-label={`Switch to ${activeTheme === "dark" ? "light" : "dark"} mode`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {activeTheme === "dark" ? <Moon size={16} color="#6366F1" /> : <Sun size={16} color="#F59E0B" />}
              <span>{activeTheme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--muted-foreground)",
                textTransform: "capitalize",
              }}
            >
              Switch
            </span>
          </button>

          {/* User Profile Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
              aria-label={`User avatar: ${displayName}`}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email ?? "Not signed in"}
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                style={{
                  color: "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  padding: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
