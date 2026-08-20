"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { goalSchema, goalContributionSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/expenses";

export async function createGoal(input: unknown): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid goal" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("goals").insert({ user_id: auth.user.id, ...parsed.data, target_date: parsed.data.target_date ?? null });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function archiveGoal(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("goals").update({ archived: true }).eq("id", id).eq("user_id", auth.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Logs a contribution and bumps the goal's saved_amount in the same action so
// the two never drift out of sync.
export async function contributeToGoal(input: unknown): Promise<ActionResult> {
  const parsed = goalContributionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid contribution" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("saved_amount")
    .eq("id", parsed.data.goal_id)
    .eq("user_id", auth.user.id)
    .single();
  if (goalError || !goal) return { ok: false, error: goalError?.message ?? "Goal not found" };

  const { error: insertError } = await supabase.from("goal_contributions").insert({ user_id: auth.user.id, ...parsed.data });
  if (insertError) return { ok: false, error: insertError.message };

  const { error: updateError } = await supabase
    .from("goals")
    .update({ saved_amount: goal.saved_amount + parsed.data.amount })
    .eq("id", parsed.data.goal_id)
    .eq("user_id", auth.user.id);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}
