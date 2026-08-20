"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { budgetSchema, recurringBillSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/expenses";

export async function upsertBudget(input: unknown): Promise<ActionResult> {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid budget" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: auth.user.id, ...parsed.data },
      { onConflict: parsed.data.category_id ? "user_id,category_id,month" : "user_id,month" }
    );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", auth.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createRecurringBill(input: unknown): Promise<ActionResult> {
  const parsed = recurringBillSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid bill" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("recurring_bills").insert({ user_id: auth.user.id, ...parsed.data });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteRecurringBill(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("recurring_bills").delete().eq("id", id).eq("user_id", auth.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true };
}
