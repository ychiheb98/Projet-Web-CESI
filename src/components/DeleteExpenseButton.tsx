"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteExpense } from "@/lib/actions/expenses";

export function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-xs text-muted">
        Delete
      </button>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteExpense(id);
          router.refresh();
        })
      }
      className="text-xs text-danger font-medium"
    >
      {pending ? "Deleting…" : "Confirm delete"}
    </button>
  );
}
