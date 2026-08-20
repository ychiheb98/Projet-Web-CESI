"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/expenses";

export async function createCategory(input: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("categories").insert({ user_id: auth.user.id, ...parsed.data });
  if (error) return { ok: false, error: error.message.includes("duplicate") ? "You already have a category with that name" : error.message };

  revalidatePath("/settings");
  revalidatePath("/expenses");
  revalidatePath("/budgets");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", auth.user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/expenses");
  revalidatePath("/budgets");
  return { ok: true };
}
