"use client";

import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/accounts";

/**
 * Shared modal shell for CRUD forms. Reuses the existing FinSight styling
 * (CSS variables, radii, borders) so no visual redesign is introduced.
 */
export function FormModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 460,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "22px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              fontSize: 13,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--secondary)",
  fontSize: 13,
  color: "var(--foreground)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-body)",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--muted-foreground)",
  marginBottom: 6,
};

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        background: "#F43F5E10",
        border: "1px solid #F43F5E30",
        borderRadius: 8,
        padding: "9px 12px",
        fontSize: 12.5,
        color: "var(--negative)",
        marginBottom: 12,
      }}
    >
      {message}
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        width: "100%",
        padding: "10px 16px",
        borderRadius: 8,
        background: "var(--primary)",
        border: "none",
        cursor: pending ? "default" : "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: "white",
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      {pending ? "Saving…" : children}
    </button>
  );
}
