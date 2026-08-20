import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/components/ExpenseForm";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const [{ data: expense }, { data: categories }] = await Promise.all([
    supabase.from("expenses").select("*").eq("id", id).eq("user_id", auth.user!.id).single(),
    supabase.from("categories").select("*").eq("user_id", auth.user!.id).order("name"),
  ]);

  if (!expense) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">Edit expense</h1>
      <ExpenseForm categories={categories ?? []} expense={expense} />
    </div>
  );
}
