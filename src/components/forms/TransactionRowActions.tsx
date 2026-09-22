"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  updateTransaction,
  deleteTransaction,
  type ActionState,
} from "@/lib/actions/transactions";
import type { SerializedAccount, SerializedTransaction } from "@/lib/data/serialize";
import { TransactionFormFields } from "@/components/forms/TransactionForm";
import { FormModal, FormError, SubmitButton } from "@/components/forms/FormModal";

/** Edit + delete controls rendered inside each transaction row. */
export function TransactionRowActions({
  transaction,
  accounts,
}: {
  transaction: SerializedTransaction;
  accounts: SerializedAccount[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editState, editAction, editPending] = useActionState<ActionState | undefined, FormData>(
    updateTransaction,
    undefined,
  );
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState | undefined, FormData>(
    deleteTransaction,
    undefined,
  );

  useEffect(() => {
    if (editState?.ok) setEditing(false);
  }, [editState]);

  useEffect(() => {
    if (deleteState?.ok) setConfirming(false);
  }, [deleteState]);

  const btnBase: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: "var(--secondary)",
    color: "var(--muted-foreground)",
    flexShrink: 0,
  };

  return (
    <>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button style={btnBase} aria-label={`Edit ${transaction.merchant}`} onClick={() => setEditing(true)}>
          <Pencil size={13} />
        </button>
        <button style={btnBase} aria-label={`Delete ${transaction.merchant}`} onClick={() => setConfirming(true)}>
          <Trash2 size={13} />
        </button>
      </div>

      {editing && accounts.length > 0 && (
        <FormModal title="Edit Transaction" onClose={() => setEditing(false)}>
          <TransactionFormFields
            accounts={accounts}
            state={editState}
            pending={editPending}
            action={editAction}
            submitLabel="Save Changes"
            initial={transaction}
          />
        </FormModal>
      )}

      {confirming && (
        <FormModal title="Delete transaction?" onClose={() => setConfirming(false)}>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 14px", lineHeight: 1.5 }}>
            Delete <strong style={{ color: "var(--foreground)" }}>{transaction.merchant}</strong> (
            {transaction.type === "INCOME" ? "+" : "−"}₹{Math.abs(Number(transaction.amount)).toFixed(2)})? The
            account balance will be adjusted. This cannot be undone.
          </p>
          <FormError message={deleteState?.ok === false ? deleteState.error : undefined} />
          <form action={deleteAction}>
            <input type="hidden" name="id" value={transaction.id} />
            <SubmitButton pending={deletePending}>Delete Transaction</SubmitButton>
          </form>
        </FormModal>
      )}
    </>
  );
}
