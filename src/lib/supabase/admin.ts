import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

// Service-role client: bypasses Row Level Security entirely.
// Server-only. Never import this from a Client Component, and never expose
// SUPABASE_SERVICE_ROLE_KEY via a NEXT_PUBLIC_ variable. It exists only for
// the cron job, which must read every user's data to evaluate their alerts.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
