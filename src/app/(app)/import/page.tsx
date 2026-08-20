import { createClient } from "@/lib/supabase/server";
import { ImportClient } from "@/components/ImportClient";

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: categories } = await supabase.from("categories").select("name").eq("user_id", auth.user!.id);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-4">Import expenses</h1>
      <ImportClient categoryNames={(categories ?? []).map((c) => c.name)} />
    </div>
  );
}
