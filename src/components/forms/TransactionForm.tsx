"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createTransaction, type ActionState } from "@/lib/actions/transactions";
import type { SerializedAccount, SerializedTransaction } from "@/lib/data/serialize";
import {
  FormModal,
  FormError,
  SubmitButton,
  inputStyle,
  labelStyle,
} from "@/components/forms/FormModal";

const CATEGORIES = [
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

export function AddTransactionButton({ accounts }: { accounts: SerializedAccount[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    createTransaction,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  if (accounts.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 16px",
          borderRadius: 8,
          background: "var(--primary)",
          fontSize: 13,
          fontWeight: 600,
          color: "white",
          opacity: 0.6,
        }}
        title="Create an account first"
      >
        <Plus size={14} /> Add Transaction
      </div>
    );
  }

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
        <Plus size={14} /> Add Transaction
      </button>
      {open && (
        <FormModal title="Add Transaction" onClose={() => setOpen(false)}>
          <TransactionFormFields accounts={accounts} state={state} pending={pending} action={action} submitLabel="Save Transaction" />
        </FormModal>
      )}
    </>
  );
}

export function TransactionFormFields({
  accounts,
  state,
  pending,
  action,
  submitLabel,
  initial,
}: {
  accounts: SerializedAccount[];
  state: ActionState | undefined;
  pending: boolean;
  action: (formData: FormData) => void;
  submitLabel: string;
  initial?: SerializedTransaction;
}) {
  return (
    <form action={action}>
      <FormError message={state?.ok === false ? state.error : undefined} />
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="txn-account" style={labelStyle}>Account</label>
        <select
          id="txn-account"
          name="accountId"
          defaultValue={initial?.accountId ?? accounts[0]?.id}
          required
          style={inputStyle}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label htmlFor="txn-type" style={labelStyle}>Type</label>
          <select id="txn-type" name="type" defaultValue={initial?.type ?? "EXPENSE"} style={inputStyle}>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
        <div>
          <label htmlFor="txn-amount" style={labelStyle}>Amount</label>
          <input
            id="txn-amount"
            name="amount"
            required
            inputMode="decimal"
            placeholder="0.00"
            defaultValue={initial?.amount}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="txn-merchant" style={labelStyle}>Merchant</label>
        <input id="txn-merchant" name="merchant" required maxLength={120} defaultValue={initial?.merchant} style={inputStyle} placeholder="e.g. BigBasket" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label htmlFor="txn-category" style={labelStyle}>Category</label>
          <select id="txn-category" name="category" defaultValue={initial?.category ?? "Food"} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="txn-date" style={labelStyle}>Date</label>
          <input id="txn-date" name="date" type="date" required defaultValue={initial?.date ?? todayIso()} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label htmlFor="txn-description" style={labelStyle}>Description (optional)</label>
        <input id="txn-description" name="description" maxLength={240} defaultValue={initial?.description ?? ""} style={inputStyle} />
      </div>

      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
    </form>
  );
}

function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
