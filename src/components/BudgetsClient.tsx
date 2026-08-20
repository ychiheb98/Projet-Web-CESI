"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertBudget, createRecurringBill, deleteRecurringBill } from "@/lib/actions/budgets";
import { formatCurrency } from "@/lib/budget-engine";
import type { Category, Budget, RecurringBill } from "@/lib/types";

export function BudgetsClient({
  month,
  currency,
  categories,
  budgets,
  bills,
}: {
  month: string;
  currency: string;
  categories: Category[];
  budgets: Budget[];
  bills: RecurringBill[];
}) {
  const router = useRouter();
  const overall = budgets.find((b) => b.category_id === null);
  const [overallAmount, setOverallAmount] = useState(overall ? String(overall.amount) : "");
  const [categoryAmounts, setCategoryAmounts] = useState<Record<string, string>>(
    Object.fromEntries(categories.map((c) => [c.id, String(budgets.find((b) => b.category_id === c.id)?.amount ?? "")]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveBudgets(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const results = await Promise.all([
      upsertBudget({ category_id: null, month, amount: overallAmount || 0 }),
      ...categories
        .filter((c) => categoryAmounts[c.id] !== "")
        .map((c) => upsertBudget({ category_id: c.id, month, amount: categoryAmounts[c.id] })),
    ]);

    setSaving(false);
    const failed = results.find((r) => !r.ok);
    if (failed && !failed.ok) {
      setError(failed.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={saveBudgets} className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="overall">
            Overall monthly budget
          </label>
          <input
            id="overall"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={overallAmount}
            onChange={(e) => setOverallAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted mt-1">This drives your daily safe-to-spend number.</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Per-category budgets (optional)</p>
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-sm text-foreground flex-1">{c.name}</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="—"
                value={categoryAmounts[c.id]}
                onChange={(e) => setCategoryAmounts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                className="w-28 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground text-right outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary text-primary-foreground font-medium py-2.5 disabled:opacity-60">
          {saving ? "Saving…" : "Save budgets"}
        </button>
      </form>

      <RecurringBills bills={bills} currency={currency} />
    </div>
  );
}

function RecurringBills({ bills, currency }: { bills: RecurringBill[]; currency: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createRecurringBill({ name, amount, due_day: dueDay });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setAmount("");
    setDueDay("1");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <p className="font-medium text-foreground">Recurring bills</p>
      <p className="text-xs text-muted -mt-2">
        Reserved out of your daily allowance until each bill&rsquo;s due day passes.
      </p>

      {bills.length > 0 && (
        <ul className="divide-y divide-border">
          {bills.map((bill) => (
            <li key={bill.id} className="py-2 flex items-center justify-between text-sm">
              <span className="text-foreground">{bill.name} · day {bill.due_day}</span>
              <div className="flex items-center gap-3">
                <span className="text-foreground font-medium">{formatCurrency(bill.amount, currency)}</span>
                <button
                  onClick={async () => {
                    await deleteRecurringBill(bill.id);
                    router.refresh();
                  }}
                  className="text-xs text-danger"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAdd} className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground" />
        </div>
        <div className="w-24">
          <label className="block text-xs text-muted mb-1">Amount</label>
          <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground" />
        </div>
        <div className="w-16">
          <label className="block text-xs text-muted mb-1">Day</label>
          <input type="number" min="1" max="28" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground" />
        </div>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 disabled:opacity-60">
          Add
        </button>
      </form>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
