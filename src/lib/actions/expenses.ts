"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema, csvImportSchema } from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createExpense(input: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid expense" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("expenses").insert({
    user_id: auth.user.id,
    amount: parsed.data.amount,
    category_id: parsed.data.category_id ?? null,
    occurred_on: parsed.data.occurred_on,
    note: parsed.data.note ?? null,
    source: "manual",
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { ok: true };
}

export async function updateExpense(id: string, input: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid expense" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("expenses")
    .update({
      amount: parsed.data.amount,
      category_id: parsed.data.category_id ?? null,
      occurred_on: parsed.data.occurred_on,
      note: parsed.data.note ?? null,
    })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", auth.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { ok: true };
}

export type ImportRow = { amount: number; occurred_on: string; note?: string | null; category_name?: string | null };

// Bulk-inserts parsed CSV rows. Rows are already structured JSON by the time
// they reach the server — the uploaded file itself is parsed client-side and
// never executed or stored, only the numbers/dates/text extracted from it.
export async function importExpenses(rows: ImportRow[]): Promise<{ ok: true; inserted: number } | { ok: false; error: string }> {
  const parsed = csvImportSchema.safeParse(rows);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid import data" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { data: categories } = await supabase.from("categories").select("id, name").eq("user_id", auth.user.id);
  const byName = new Map((categories ?? []).map((c) => [c.name.toLowerCase(), c.id]));

  const toInsert = parsed.data.map((row) => ({
    user_id: auth.user!.id,
    amount: row.amount,
    occurred_on: row.occurred_on,
    note: row.note ?? null,
    category_id: row.category_name ? byName.get(row.category_name.toLowerCase()) ?? null : null,
    source: "import" as const,
  }));

  const { error } = await supabase.from("expenses").insert(toInsert);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { ok: true, inserted: toInsert.length };
}
