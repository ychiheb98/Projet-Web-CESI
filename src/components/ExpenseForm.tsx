"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import type { Category, Expense } from "@/lib/types";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ExpenseForm({ categories, expense }: { categories: Category[]; expense?: Expense }) {
  const router = useRouter();
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [categoryId, setCategoryId] = useState(expense?.category_id ?? categories[0]?.id ?? "");
  const [occurredOn, setOccurredOn] = useState(expense?.occurred_on ?? todayLocal());
  const [note, setNote] = useState(expense?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const input = { amount, category_id: categoryId || null, occurred_on: occurredOn, note: note || null };
    const result = expense ? await updateExpense(expense.id, input) : await createExpense(input);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/expenses");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1" htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1" htmlFor="category">Category</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1" htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          required
          value={occurredOn}
          onChange={(e) => setOccurredOn(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1" htmlFor="note">Note (optional)</label>
        <input
          id="note"
          type="text"
          maxLength={280}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-primary text-primary-foreground font-medium py-2.5 disabled:opacity-60"
      >
        {saving ? "Saving…" : expense ? "Save changes" : "Add expense"}
      </button>
    </form>
  );
}
