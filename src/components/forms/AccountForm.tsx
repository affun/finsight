"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  type ActionState,
} from "@/lib/actions/accounts";
import type { SerializedAccount } from "@/lib/data/serialize";
import {
  FormModal,
  FormError,
  SubmitButton,
  inputStyle,
  labelStyle,
} from "@/components/forms/FormModal";

const TYPE_OPTIONS = [
  { value: "BANK", label: "Bank Account" },
  { value: "CASH", label: "Cash" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "OTHER", label: "Other" },
];

export function AddAccountButton() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    createAccount,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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
      {open && (
        <FormModal title="Add Account" onClose={() => setOpen(false)}>
          <form action={action}>
            <FormError message={state?.ok === false ? state.error : undefined} />
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="acc-name" style={labelStyle}>Account name</label>
              <input id="acc-name" name="name" required maxLength={80} style={inputStyle} placeholder="e.g. HDFC Savings" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="acc-type" style={labelStyle}>Type</label>
              <select id="acc-type" name="type" defaultValue="BANK" style={inputStyle}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <label htmlFor="acc-balance" style={labelStyle}>Opening balance</label>
                <input id="acc-balance" name="balance" inputMode="decimal" placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <label htmlFor="acc-currency" style={labelStyle}>Currency</label>
                <input id="acc-currency" name="currency" defaultValue="INR" maxLength={3} style={inputStyle} />
              </div>
            </div>
            <SubmitButton pending={pending}>Create Account</SubmitButton>
          </form>
        </FormModal>
      )}
    </>
  );
}

export function AccountActions({ account }: { account: SerializedAccount }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editState, editAction, editPending] = useActionState<ActionState | undefined, FormData>(
    updateAccount,
    undefined,
  );
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState | undefined, FormData>(
    deleteAccount,
    undefined,
  );

  useEffect(() => {
    if (editState?.ok) setEditing(false);
  }, [editState]);

  const btnBase: React.CSSProperties = {
    padding: "5px 10px",
    borderRadius: 7,
    fontSize: 12,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: "var(--secondary)",
    color: "var(--foreground)",
  };

  return (
    <>
      <div style={{ display: "flex", gap: 6 }}>
        <button style={btnBase} onClick={() => setEditing(true)}>Edit</button>
        <button style={btnBase} onClick={() => setConfirming(true)}>Delete</button>
      </div>

      {editing && (
        <FormModal title={`Edit ${account.name}`} onClose={() => setEditing(false)}>
          <form action={editAction}>
            <FormError message={editState?.ok === false ? editState.error : undefined} />
            <input type="hidden" name="id" value={account.id} />
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="acc-edit-name" style={labelStyle}>Account name</label>
              <input id="acc-edit-name" name="name" defaultValue={account.name} required maxLength={80} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="acc-edit-type" style={labelStyle}>Type</label>
              <select id="acc-edit-type" name="type" defaultValue={account.type} style={inputStyle}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="acc-edit-currency" style={labelStyle}>Currency</label>
              <input id="acc-edit-currency" name="currency" defaultValue={account.currency} maxLength={3} style={inputStyle} />
            </div>
            <SubmitButton pending={editPending}>Save Changes</SubmitButton>
          </form>
        </FormModal>
      )}

      {confirming && (
        <FormModal title={`Delete ${account.name}?`} onClose={() => setConfirming(false)}>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 14px", lineHeight: 1.5 }}>
            This permanently removes the account and its{" "}
            <strong style={{ color: "var(--foreground)" }}>{account.transactionCount}</strong>{" "}
            transaction{account.transactionCount === 1 ? "" : "s"}. This cannot be undone.
          </p>
          <FormError message={deleteState?.ok === false ? deleteState.error : undefined} />
          <form action={deleteAction}>
            <input type="hidden" name="id" value={account.id} />
            <SubmitButton pending={deletePending}>Delete Account</SubmitButton>
          </form>
        </FormModal>
      )}
    </>
  );
}
