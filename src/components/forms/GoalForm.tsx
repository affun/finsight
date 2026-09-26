"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  type ActionState,
} from "@/lib/actions/goals";
import {
  FormModal,
  FormError,
  SubmitButton,
  inputStyle,
  labelStyle,
} from "@/components/forms/FormModal";

export function AddGoalButton() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    createGoal,
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
        <Plus size={14} /> New Goal
      </button>
      {open && (
        <FormModal title="New Goal" onClose={() => setOpen(false)}>
          <GoalFields state={state} pending={pending} action={action} submitLabel="Create Goal" />
        </FormModal>
      )}
    </>
  );
}

export function GoalFields({
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
    targetAmount: string;
    currentAmount: string;
    targetDate: string | null;
  };
}) {
  return (
    <form action={action}>
      <FormError message={state?.ok === false ? state.error : undefined} />
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="goal-name" style={labelStyle}>Goal name</label>
        <input id="goal-name" name="name" required maxLength={120} defaultValue={initial?.name} style={inputStyle} placeholder="e.g. Emergency Fund" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="form-grid-2">
        <div>
          <label htmlFor="goal-target" style={labelStyle}>Target amount</label>
          <input id="goal-target" name="targetAmount" required inputMode="decimal" placeholder="0.00" defaultValue={initial?.targetAmount} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="goal-current" style={labelStyle}>Current amount</label>
          <input id="goal-current" name="currentAmount" inputMode="decimal" placeholder="0.00" defaultValue={initial?.currentAmount ?? "0"} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label htmlFor="goal-date" style={labelStyle}>Target date (optional)</label>
        <input id="goal-date" name="targetDate" type="date" defaultValue={initial?.targetDate ?? ""} style={inputStyle} />
      </div>

      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
    </form>
  );
}

export function GoalCardActions({
  goal,
}: {
  goal: {
    id: string;
    name: string;
    targetAmount: string;
    currentAmount: string;
    targetDate: string | null;
  };
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editState, editAction, editPending] = useActionState<ActionState | undefined, FormData>(
    updateGoal,
    undefined,
  );
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState | undefined, FormData>(
    deleteGoal,
    undefined,
  );

  useEffect(() => {
    if (editState?.ok) setEditing(false);
  }, [editState]);
  useEffect(() => {
    if (deleteState?.ok) setConfirming(false);
  }, [deleteState]);

  const btnBase: React.CSSProperties = {
    padding: "5px 10px",
    borderRadius: 7,
    fontSize: 11,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: "var(--secondary)",
    color: "var(--muted-foreground)",
  };

  return (
    <>
      <div style={{ display: "flex", gap: 6 }}>
        <button style={btnBase} onClick={() => setEditing(true)} aria-label={`Edit goal ${goal.name}`}>
          <Pencil size={12} />
        </button>
        <button style={btnBase} onClick={() => setConfirming(true)} aria-label={`Delete goal ${goal.name}`}>
          <Trash2 size={12} />
        </button>
      </div>

      {editing && (
        <FormModal title={`Edit ${goal.name}`} onClose={() => setEditing(false)}>
          <GoalFields
            state={editState}
            pending={editPending}
            action={editAction}
            submitLabel="Save Changes"
            initial={goal}
          />
        </FormModal>
      )}

      {confirming && (
        <FormModal title={`Delete ${goal.name}?`} onClose={() => setConfirming(false)}>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 14px", lineHeight: 1.5 }}>
            The goal and its progress tracking will be removed. This cannot be undone.
          </p>
          <FormError message={deleteState?.ok === false ? deleteState.error : undefined} />
          <form action={deleteAction}>
            <input type="hidden" name="id" value={goal.id} />
            <SubmitButton pending={deletePending}>Delete Goal</SubmitButton>
          </form>
        </FormModal>
      )}
    </>
  );
}
