import { createClient } from "@/lib/supabase/server";
import { todayInTimeZone, monthKey } from "@/lib/date";
import { BudgetsClient } from "@/components/BudgetsClient";

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user!.id).single();
  const currency = profile?.currency ?? "USD";
  const month = monthKey(todayInTimeZone(profile?.timezone ?? "UTC"));

  const [{ data: categories }, { data: budgets }, { data: bills }] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", auth.user!.id).order("name"),
    supabase.from("budgets").select("*").eq("user_id", auth.user!.id).eq("month", month),
    supabase.from("recurring_bills").select("*").eq("user_id", auth.user!.id).order("due_day"),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-4">Budgets</h1>
      <BudgetsClient
        month={month}
        currency={currency}
        categories={categories ?? []}
        budgets={budgets ?? []}
        bills={bills ?? []}
      />
    </div>
  );
}
