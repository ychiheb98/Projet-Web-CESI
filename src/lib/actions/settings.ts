"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { alertSettingsSchema, profileSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/expenses";

export async function updateAlertSettings(input: unknown): Promise<ActionResult> {
  const parsed = alertSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid settings" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("alert_settings")
    .upsert({ user_id: auth.user.id, ...parsed.data, updated_at: new Date().toISOString() });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile" };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", auth.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
