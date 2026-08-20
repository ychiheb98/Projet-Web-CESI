import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/budget-engine";
import { DeleteExpenseButton } from "@/components/DeleteExpenseButton";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const [{ data: profile }, { data: expenses }, { data: categories }] = await Promise.all([
    supabase.from("profiles").select("currency").eq("id", auth.user!.id).single(),
    supabase.from("expenses").select("*").eq("user_id", auth.user!.id).order("occurred_on", { ascending: false }).limit(100),
    supabase.from("categories").select("*").eq("user_id", auth.user!.id),
  ]);

  const currency = profile?.currency ?? "USD";
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-foreground">Expenses</h1>
        <Link href="/import" className="text-sm text-primary font-medium">Import CSV</Link>
      </div>

      {(!expenses || expenses.length === 0) ? (
        <p className="text-sm text-muted">No expenses yet. Tap the + button to add one.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {expenses.map((expense) => {
            const category = categoryById.get(expense.category_id ?? "");
            return (
              <li key={expense.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {category?.name ?? "Uncategorized"}
                    {expense.note ? ` · ${expense.note}` : ""}
                  </p>
                  <p className="text-xs text-muted">{expense.occurred_on}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(Number(expense.amount), currency)}</p>
                  <Link href={`/expenses/${expense.id}/edit`} className="text-xs text-primary">Edit</Link>
                  <DeleteExpenseButton id={expense.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
