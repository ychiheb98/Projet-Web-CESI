"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createGoal, archiveGoal, contributeToGoal } from "@/lib/actions/goals";
import { formatCurrency } from "@/lib/budget-engine";
import { ProgressBar } from "@/components/ProgressBar";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
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
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-foreground">{goal.name}</p>
          <p className="text-sm text-muted">
            {formatCurrency(goal.saved_amount, currency)} of {formatCurrency(goal.target_amount, currency)}
            {goal.target_date ? ` · by ${goal.target_date}` : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 text-muted"
          onClick={async () => {
            await archiveGoal(goal.id);
            router.refresh();
          }}
        >
          Archive
        </Button>
      </div>

      <div className="mt-3">
        <ProgressBar value={pct} colorClass="bg-primary" />
      </div>

      {contributing ? (
        <form onSubmit={onContribute} className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor={`contribute-${goal.id}`}>Add contribution</Label>
            <Input
              id={`contribute-${goal.id}`}
              type="number"
              step="0.01"
              min="0.01"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="py-1.5"
            />
          </div>
          <Button type="submit" disabled={saving} size="sm">{saving ? "Saving…" : "Save"}</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setContributing(false)}>Cancel</Button>
        </form>
      ) : (
        <Button variant="link" className="mt-3" onClick={() => setContributing(true)}>
          + Add contribution
        </Button>
      )}
      {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
    </Card>
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
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-border py-3.5 text-sm text-primary font-medium hover:bg-surface-inset transition-colors"
      >
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
    <Card>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <Label htmlFor="goal-name">Goal name</Label>
          <Input id="goal-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="goal-target">Target amount</Label>
          <Input id="goal-target" type="number" step="0.01" min="0.01" required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="goal-date">Target date (optional)</Label>
          <Input id="goal-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Saving…" : "Create goal"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
