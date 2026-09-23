"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  createBudget,
  updateBudget,
  deleteBudget,
  type ActionState,
} from "@/lib/actions/budgets";
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
  "Other",
];

export function AddBudgetButton() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    createBudget,
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
        <Plus size={14} /> Create Budget
      </button>
      {open && (
        <FormModal title="Create Budget" onClose={() => setOpen(false)}>
          <BudgetFields state={state} pending={pending} action={action} submitLabel="Create Budget" />
        </FormModal>
      )}
    </>
  );
}

export function BudgetFields({
  state,
  pending,
  action,
  submitLabel,
  initial,
}: {
  state: ActionState | undefined;
  pending: boolean;
  action: (formData: FormData) => void;
  submitLabel: string;
  initial?: {
    id: string;
    name: string;
    amount: string;
    period: string;
    startDate: string;
    endDate: string | null;
    categories: { category: string; allocatedAmount: string }[];
  };
}) {
  return (
    <form action={action}>
      <FormError message={state?.ok === false ? state.error : undefined} />
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="bud-name" style={labelStyle}>Budget name</label>
        <input id="bud-name" name="name" required maxLength={80} defaultValue={initial?.name} style={inputStyle} placeholder="e.g. September Monthly" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label htmlFor="bud-amount" style={labelStyle}>Total amount</label>
          <input id="bud-amount" name="amount" required inputMode="decimal" placeholder="0.00" defaultValue={initial?.amount} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="bud-period" style={labelStyle}>Period</label>
          <select id="bud-period" name="period" defaultValue={initial?.period ?? "MONTHLY"} style={inputStyle}>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label htmlFor="bud-start" style={labelStyle}>Start date</label>
          <input id="bud-start" name="startDate" type="date" required defaultValue={initial?.startDate ?? firstOfMonth()} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="bud-end" style={labelStyle}>End date (optional)</label>
          <input id="bud-end" name="endDate" type="date" defaultValue={initial?.endDate ?? ""} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Category allocations</label>
        {CATEGORIES.map((cat) => (
          <div key={cat} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--foreground)", width: 96, flexShrink: 0 }}>{cat}</span>
            <input
              name="allocations"
              inputMode="decimal"
              placeholder="—"
              defaultValue={initial?.categories.find((c) => c.category === cat)?.allocatedAmount ?? ""}
              aria-label={`${cat} allocation`}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
            <input type="hidden" name="categories" value={cat} />
          </div>
        ))}
      </div>

      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
    </form>
  );
}

export function BudgetCardActions({
  budget,
}: {
  budget: {
    id: string;
    name: string;
    amount: string;
    period: string;
    startDate: string;
    endDate: string | null;
    categories: { category: string; allocatedAmount: string }[];
  };
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editState, editAction, editPending] = useActionState<ActionState | undefined, FormData>(
    updateBudget,
    undefined,
  );
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState | undefined, FormData>(
    deleteBudget,
    undefined,
  );

  useEffect(() => {
    if (editState?.ok) setEditing(false);
  }, [editState]);

  const btnBase: React.CSSProperties = {
    padding: "4px 9px",
    borderRadius: 6,
    fontSize: 11,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: "var(--secondary)",
    color: "var(--muted-foreground)",
  };

  return (
    <>
      <div style={{ display: "flex", gap: 5 }}>
        <button style={btnBase} onClick={() => setEditing(true)} aria-label={`Edit budget ${budget.name}`}>
          <Pencil size={11} />
        </button>
        <button style={btnBase} onClick={() => setConfirming(true)} aria-label={`Delete budget ${budget.name}`}>
          <Trash2 size={11} />
        </button>
      </div>

      {editing && (
        <FormModal title={`Edit ${budget.name}`} onClose={() => setEditing(false)}>
          <BudgetFields
            state={editState}
            pending={editPending}
            action={editAction}
            submitLabel="Save Changes"
            initial={budget}
          />
        </FormModal>
      )}

      {confirming && (
        <FormModal title={`Delete ${budget.name}?`} onClose={() => setConfirming(false)}>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 14px", lineHeight: 1.5 }}>
            The budget and its category allocations will be removed. Transactions are not affected.
          </p>
          <FormError message={deleteState?.ok === false ? deleteState.error : undefined} />
          <form action={deleteAction}>
            <input type="hidden" name="id" value={budget.id} />
            <SubmitButton pending={deletePending}>Delete Budget</SubmitButton>
          </form>
        </FormModal>
      )}
    </>
  );
}

function firstOfMonth(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-01`;
}
