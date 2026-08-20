import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserBudgetSnapshot } from "@/lib/dashboard-data";
import { formatCurrency, paceMessage } from "@/lib/budget-engine";
import { ProgressBar } from "@/components/ProgressBar";
import { AiInsightPanel } from "@/components/AiInsightPanel";

const PACE_COLOR: Record<string, string> = {
  ahead: "text-success",
  on_track: "text-primary",
  behind: "text-danger",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
  const currency = profile?.currency ?? "USD";
  const timezone = profile?.timezone ?? "UTC";

  const snapshot = await getUserBudgetSnapshot(supabase, auth.user.id, timezone);
  const { allowance } = snapshot;

  if (snapshot.overallBudget === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-foreground font-medium">Set a monthly budget to get started</p>
        <p className="text-sm text-muted mt-1">Once you set an overall monthly budget, we&rsquo;ll tell you exactly how much you can spend per day.</p>
        <Link href="/budgets" className="inline-block mt-4 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
          Set your budget
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-primary text-primary-foreground p-6">
        <p className="text-sm opacity-80">Safe to spend today</p>
        <p className="text-4xl font-semibold mt-1">{formatCurrency(allowance.dailyAllowance, currency)}</p>
        <p className="text-sm opacity-80 mt-2">{allowance.daysLeftIncludingToday} days left this month</p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground">This month</p>
          <p className={`text-sm font-medium ${PACE_COLOR[allowance.paceStatus]}`}>
            {allowance.paceStatus === "behind" ? "Overspending" : allowance.paceStatus === "ahead" ? "Ahead of plan" : "On track"}
          </p>
        </div>
        <ProgressBar
          value={snapshot.spentThisMonth / snapshot.overallBudget}
          colorClass={allowance.paceStatus === "behind" ? "bg-danger" : "bg-primary"}
        />
        <div className="flex justify-between text-sm text-muted mt-1.5">
          <span>{formatCurrency(snapshot.spentThisMonth, currency)} spent</span>
          <span>{formatCurrency(snapshot.overallBudget, currency)} budget</span>
        </div>
        <p className="text-sm text-foreground mt-3">{paceMessage(allowance, currency)}</p>
        {allowance.reserved > 0 && (
          <p className="text-xs text-muted mt-2">
            {formatCurrency(allowance.reserved, currency)} reserved for upcoming bills and goal savings.
          </p>
        )}
      </section>

      {snapshot.goals.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <p className="font-medium text-foreground mb-3">Goals</p>
          <div className="space-y-3">
            {snapshot.goals.slice(0, 3).map((goal) => (
              <div key={goal.id}>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{goal.name}</span>
                  <span className="text-muted">
                    {formatCurrency(goal.saved_amount, currency)} / {formatCurrency(goal.target_amount, currency)}
                  </span>
                </div>
                <div className="mt-1">
                  <ProgressBar value={goal.saved_amount / goal.target_amount} colorClass="bg-success" />
                </div>
              </div>
            ))}
          </div>
          <Link href="/goals" className="text-sm text-primary font-medium mt-3 inline-block">View all goals</Link>
        </section>
      )}

      {snapshot.categoryBudgets.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <p className="font-medium text-foreground mb-3">Spending by category</p>
          <div className="space-y-3">
            {snapshot.categoryBudgets.map((budget) => {
              const category = snapshot.categories.find((c) => c.id === budget.category_id);
              const spent = snapshot.spentByCategory.get(budget.category_id!) ?? 0;
              const over = spent > budget.amount;
              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{category?.name ?? "Category"}</span>
                    <span className={over ? "text-danger" : "text-muted"}>
                      {formatCurrency(spent, currency)} / {formatCurrency(budget.amount, currency)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <ProgressBar value={budget.amount > 0 ? spent / budget.amount : 0} colorClass={over ? "bg-danger" : "bg-primary"} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <AiInsightPanel />

      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-foreground">Recent expenses</p>
          <Link href="/expenses" className="text-sm text-primary font-medium">See all</Link>
        </div>
        {snapshot.recentExpenses.length === 0 ? (
          <p className="text-sm text-muted">No expenses logged yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {snapshot.recentExpenses.map((expense) => {
              const category = snapshot.categories.find((c) => c.id === expense.category_id);
              return (
                <li key={expense.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{category?.name ?? "Uncategorized"}</p>
                    <p className="text-xs text-muted">{expense.occurred_on}{expense.note ? ` · ${expense.note}` : ""}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{formatCurrency(Number(expense.amount), currency)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
