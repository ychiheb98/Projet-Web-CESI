import type { SupabaseClient } from "@supabase/supabase-js";
import { computeDailyAllowance, sumRequiredMonthlySavings, sumUpcomingBills } from "@/lib/budget-engine";
import { todayInTimeZone, monthKey } from "@/lib/date";
import type { Database } from "@/lib/types";

// Shared by the dashboard page and the daily cron job, so the numbers a user
// sees in the app are exactly the numbers the email alert is based on.
export async function getUserBudgetSnapshot(supabase: SupabaseClient<Database>, userId: string, timezone: string) {
  const today = todayInTimeZone(timezone);
  const month = monthKey(today);
  const nextMonth = monthKey(new Date(today.getFullYear(), today.getMonth() + 1, 1));

  const [{ data: budgets }, { data: expenses }, { data: goals }, { data: bills }, { data: categories }] = await Promise.all([
    supabase.from("budgets").select("*").eq("user_id", userId).eq("month", month),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .gte("occurred_on", month)
      .lt("occurred_on", nextMonth)
      .order("occurred_on", { ascending: false }),
    supabase.from("goals").select("*").eq("user_id", userId).eq("archived", false),
    supabase.from("recurring_bills").select("*").eq("user_id", userId).eq("active", true),
    supabase.from("categories").select("*").eq("user_id", userId),
  ]);

  const overallBudget = (budgets ?? []).find((b) => b.category_id === null)?.amount ?? 0;
  const categoryBudgets = (budgets ?? []).filter((b) => b.category_id !== null);
  const spentThisMonth = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

  const requiredMonthlySavings = sumRequiredMonthlySavings(goals ?? [], today);
  const upcomingBills = sumUpcomingBills(bills ?? [], today);

  const allowance = computeDailyAllowance({
    monthlyBudget: overallBudget,
    spentThisMonth,
    today,
    upcomingBills,
    requiredMonthlySavings,
  });

  const spentByCategory = new Map<string, number>();
  for (const e of expenses ?? []) {
    if (!e.category_id) continue;
    spentByCategory.set(e.category_id, (spentByCategory.get(e.category_id) ?? 0) + Number(e.amount));
  }

  return {
    today,
    month,
    overallBudget,
    spentThisMonth,
    requiredMonthlySavings,
    upcomingBills,
    allowance,
    goals: goals ?? [],
    bills: bills ?? [],
    categories: categories ?? [],
    categoryBudgets,
    spentByCategory,
    recentExpenses: (expenses ?? []).slice(0, 8),
  };
}

export type BudgetSnapshot = Awaited<ReturnType<typeof getUserBudgetSnapshot>>;
