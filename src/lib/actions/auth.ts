"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// This app is single-user: once one account exists, signup locks itself shut.
// Checked with the admin client (bypasses RLS) since an anonymous visitor
// hitting this page has no session yet to read profiles under RLS.
export async function signUp(email: string, password: string): Promise<AuthResult> {
  const admin = createAdminClient();
  const { count, error: countError } = await admin.from("profiles").select("id", { count: "exact", head: true });
  if (countError) return { ok: false, error: countError.message };
  if ((count ?? 0) > 0) {
    return { ok: false, error: "Signups are closed — this app is set up for a single account." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
