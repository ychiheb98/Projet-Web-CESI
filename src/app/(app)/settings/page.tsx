import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import { AlertSettingsForm } from "@/components/AlertSettingsForm";
import { CategoriesManager } from "@/components/CategoriesManager";
import { MfaSettings } from "@/components/MfaSettings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const [{ data: profile }, { data: alertSettings }, { data: categories }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user!.id).single(),
    supabase.from("alert_settings").select("*").eq("user_id", auth.user!.id).single(),
    supabase.from("categories").select("*").eq("user_id", auth.user!.id).order("name"),
  ]);

  if (!profile || !alertSettings) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      <MfaSettings />
      <ProfileForm profile={profile} />
      <AlertSettingsForm settings={alertSettings} />
      <CategoriesManager categories={categories ?? []} />
    </div>
  );
}
