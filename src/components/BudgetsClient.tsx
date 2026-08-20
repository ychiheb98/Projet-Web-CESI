"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { upsertBudget, createRecurringBill, deleteRecurringBill } from "@/lib/actions/budgets";
import { formatCurrency } from "@/lib/budget-engine";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
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
      <Card>
        <form onSubmit={saveBudgets} className="space-y-4">
          <div>
            <Label htmlFor="overall">Overall monthly budget</Label>
            <Input
              id="overall"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={overallAmount}
              onChange={(e) => setOverallAmount(e.target.value)}
            />
            <p className="text-xs text-muted mt-1.5">This drives your daily safe-to-spend number.</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Per-category budgets (optional)</p>
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-sm text-foreground flex-1">{c.name}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="—"
                  value={categoryAmounts[c.id]}
                  onChange={(e) => setCategoryAmounts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="w-28 py-1.5 text-right"
                />
              </div>
            ))}
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" disabled={saving} size="lg" className="w-full">
            {saving ? "Saving…" : "Save budgets"}
          </Button>
        </form>
      </Card>

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
    <Card className="space-y-3">
      <div>
        <CardTitle>Recurring bills</CardTitle>
        <p className="text-xs text-muted mt-0.5">Reserved out of your daily allowance until each bill&rsquo;s due day passes.</p>
      </div>

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
                  className="text-muted"
                  aria-label={`Remove ${bill.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAdd} className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="bill-name">Name</Label>
          <Input id="bill-name" value={name} onChange={(e) => setName(e.target.value)} required className="py-1.5" />
        </div>
        <div className="w-24">
          <Label htmlFor="bill-amount">Amount</Label>
          <Input id="bill-amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="py-1.5" />
        </div>
        <div className="w-16">
          <Label htmlFor="bill-day">Day</Label>
          <Input id="bill-day" type="number" min="1" max="28" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required className="py-1.5" />
        </div>
        <Button type="submit" disabled={saving} size="sm">Add</Button>
      </form>
      {error && <Alert variant="danger">{error}</Alert>}
    </Card>
  );
}
