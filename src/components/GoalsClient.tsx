"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createGoal, archiveGoal, contributeToGoal } from "@/lib/actions/goals";
import { formatCurrency } from "@/lib/budget-engine";
import { ProgressBar } from "@/components/ProgressBar";
import type { Goal } from "@/lib/types";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function GoalsClient({ goals, currency }: { goals: Goal[]; currency: string }) {
  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} currency={currency} />
      ))}
      <NewGoalForm />
    </div>
  );
}

function GoalCard({ goal, currency }: { goal: Goal; currency: string }) {
  const router = useRouter();
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pct = goal.saved_amount / goal.target_amount;

  async function onContribute(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await contributeToGoal({ goal_id: goal.id, amount, occurred_on: todayLocal() });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAmount("");
    setContributing(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{goal.name}</p>
          <p className="text-sm text-muted">
            {formatCurrency(goal.saved_amount, currency)} of {formatCurrency(goal.target_amount, currency)}
            {goal.target_date ? ` · by ${goal.target_date}` : ""}
          </p>
        </div>
        <button
          onClick={async () => {
            await archiveGoal(goal.id);
            router.refresh();
          }}
          className="text-xs text-muted"
        >
          Archive
        </button>
      </div>

      <div className="mt-3">
        <ProgressBar value={pct} colorClass={pct >= 1 ? "bg-success" : "bg-primary"} />
      </div>

      {contributing ? (
        <form onSubmit={onContribute} className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1">Add contribution</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground"
            />
          </div>
          <button type="submit" disabled={saving} className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setContributing(false)} className="text-sm text-muted px-2">
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setContributing(true)} className="mt-3 text-sm text-primary font-medium">
          + Add contribution
        </button>
      )}
      {error && <p className="text-sm text-danger mt-2">{error}</p>}
    </div>
  );
}

function NewGoalForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-primary font-medium">
        + New goal
      </button>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createGoal({ name, target_amount: targetAmount, target_date: targetDate || null });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setName("");
    setTargetAmount("");
    setTargetDate("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div>
        <label className="block text-xs text-muted mb-1">Goal name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1">Target amount</label>
        <input type="number" step="0.01" min="0.01" required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1">Target date (optional)</label>
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-60">
          {saving ? "Saving…" : "Create goal"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted px-3">
          Cancel
        </button>
      </div>
    </form>
  );
}
