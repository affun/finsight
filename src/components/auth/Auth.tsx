"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, PieChart } from "lucide-react";

type AuthMode = "login" | "register";

interface AuthProps {
  mode: AuthMode;
}

function Input({
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "10px 14px",
            paddingRight: isPassword ? 40 : 14,
            borderRadius: 8,
            border: `1px solid ${error ? "var(--negative)" : "var(--border)"}`,
            background: "var(--secondary)",
            color: "var(--foreground)",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "var(--font-body)",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              display: "flex",
              padding: 0,
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 12, color: "var(--negative)" }}>{error}</div>}
    </div>
  );
}

export default function Auth({ mode }: AuthProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isLogin = mode === "login";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!isLogin && password !== confirm) errs.confirm = "Passwords do not match";
    if (!isLogin && !name) errs.name = "Name is required";

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      router.push("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--card)",
          borderRadius: 16,
          padding: 40,
          border: "1px solid var(--border)",
          boxShadow: "0 24px 60px #0000001a",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
            justifyContent: "center",
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
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}
          >
            FinSight
          </span>
        </Link>

        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
            margin: "0 0 6px",
            textAlign: "center",
          }}
        >
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted-foreground)", textAlign: "center", margin: "0 0 28px" }}>
          {isLogin ? "Sign in to your FinSight account" : "Start your 30-day free trial"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!isLogin && (
            <Input label="Full name" type="text" value={name} onChange={setName} placeholder="Alex Johnson" error={errors.name} />
          )}
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="alex@example.com" error={errors.email} />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" error={errors.password} />
          {!isLogin && (
            <Input label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" error={errors.confirm} />
          )}
          {isLogin && (
            <div style={{ textAlign: "right", marginTop: -8 }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--primary)",
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 9,
              background: "var(--primary)",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 600,
              color: "white",
              marginTop: 4,
              boxShadow: "0 4px 16px #6366F140",
            }}
          >
            {isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted-foreground)" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isLogin ? "/register" : "/login"}
            style={{
              color: "var(--primary)",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </div>

        {isLogin && (
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 20, textAlign: "center" }}>
            <Link
              href="/dashboard"
              style={{
                fontSize: 13,
                color: "var(--muted-foreground)",
                textDecoration: "none",
              }}
            >
              View demo without signing in →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
