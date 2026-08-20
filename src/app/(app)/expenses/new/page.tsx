import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/components/ExpenseForm";

export default async function NewExpensePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", auth.user!.id)
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">Add expense</h1>
      <ExpenseForm categories={categories ?? []} />
    </div>
  );
}
