"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { Eye, EyeOff, PieChart, Loader2 } from "lucide-react";

import { loginAction, registerAction, type AuthFormState } from "@/lib/actions/auth";

type AuthMode = "login" | "register";

interface AuthProps {
  mode: AuthMode;
}

function Input({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
}: {
  id: string;
  name: string;
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
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          name={name}
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={isPassword ? (id === "confirm" ? "new-password" : "current-password") : id === "email" ? "email" : "name"}
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
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
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
      {error && <div id={`${id}-error`} role="alert" style={{ fontSize: 12, color: "var(--negative)" }}>{error}</div>}
    </div>
  );
}

export default function Auth({ mode }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const isLogin = mode === "login";

  const action = isLogin ? loginAction : registerAction;
  const [state, formAction, isPending] = React.useActionState<AuthFormState, FormData>(action, {});

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
          {isLogin ? "Sign in to your FinSight account" : "Create your free demo account"}
        </p>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
          {!isLogin && (
            <Input id="name" name="name" label="Full name" type="text" value={name} onChange={setName} placeholder="Alex Johnson" error={state.fieldErrors?.name} />
          )}
          <Input id="email" name="email" label="Email" type="email" value={email} onChange={setEmail} placeholder="alex@example.com" error={state.fieldErrors?.email} />
          <Input id="password" name="password" label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" error={state.fieldErrors?.password} />
          {!isLogin && (
            <Input id="confirm" name="confirmPassword" label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" error={state.fieldErrors?.confirmPassword} />
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
          {state.error && (
            <div
              role="alert"
              style={{
                fontSize: 13,
                color: "var(--negative)",
                background: "color-mix(in srgb, var(--negative) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--negative) 35%, transparent)",
                borderRadius: 8,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              {state.error}
            </div>
          )}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 9,
              background: "var(--primary)",
              border: "none",
              cursor: isPending ? "wait" : "pointer",
              fontSize: 15,
              fontWeight: 600,
              color: "white",
              marginTop: 4,
              boxShadow: "0 4px 16px #6366F140",
              opacity: isPending ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? (isLogin ? "Signing in…" : "Creating account…") : isLogin ? "Sign in" : "Create account"}
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
      </div>
    </div>
  );
}
