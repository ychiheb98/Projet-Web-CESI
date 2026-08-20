import { createClient } from "@/lib/supabase/server";
import { GoalsClient } from "@/components/GoalsClient";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const [{ data: profile }, { data: goals }] = await Promise.all([
    supabase.from("profiles").select("currency").eq("id", auth.user!.id).single(),
    supabase.from("goals").select("*").eq("user_id", auth.user!.id).eq("archived", false).order("priority", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">Goals</h1>
      <GoalsClient goals={goals ?? []} currency={profile?.currency ?? "USD"} />
    </div>
  );
}
