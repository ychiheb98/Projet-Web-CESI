"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import { Input, Select, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
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
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" required value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" type="text" maxLength={280} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button type="submit" disabled={saving} size="lg" className="w-full">
        {saving ? "Saving…" : expense ? "Save changes" : "Add expense"}
      </Button>
    </form>
  );
}
