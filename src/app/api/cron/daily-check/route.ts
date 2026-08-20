import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserBudgetSnapshot } from "@/lib/dashboard-data";
import { dailyDigestEmail, budgetAlertEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

// Triggered daily by Vercel Cron (see vercel.json). Iterates every user with
// alerts enabled, recomputes their daily allowance with the service-role
// client (which bypasses RLS by design — this is the one place that's
// supposed to see every user's data), and emails anything that needs
// attention. alert_log's per-day unique index stops duplicate sends if the
// job runs twice.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const fromAddress = process.env.ALERT_FROM_EMAIL ?? "Budget <onboarding@resend.dev>";

  const { data: allSettings } = await admin
    .from("alert_settings")
    .select("*")
    .or("daily_digest.eq.true,overspend_alerts.eq.true");

  const results: Array<{ user_id: string; sent: string[] }> = [];

  for (const settings of allSettings ?? []) {
    const { data: profile } = await admin.from("profiles").select("*").eq("id", settings.user_id).single();
    if (!profile) continue;

    const snapshot = await getUserBudgetSnapshot(admin, settings.user_id, profile.timezone);
    if (snapshot.overallBudget <= 0) continue;

    const sent: string[] = [];

    if (settings.daily_digest && (await shouldSend(admin, settings.user_id, "daily_digest"))) {
      const email = dailyDigestEmail(snapshot, profile.currency, profile.display_name);
      if (await deliver(resend, fromAddress, settings.email, email)) {
        await logAlert(admin, settings.user_id, "daily_digest");
        sent.push("daily_digest");
      }
    }

    if (settings.overspend_alerts) {
      const reasons: string[] = [];
      const { allowance } = snapshot;

      if (allowance.expectedSpendByToday > 0) {
        const pacePct = (snapshot.spentThisMonth / allowance.expectedSpendByToday) * 100;
        if (pacePct > Number(settings.overspend_threshold_pct)) {
          reasons.push(
            `You've spent ${pacePct.toFixed(0)}% of your expected pace for this point in the month.`
          );
        }
      }

      if (Number(settings.low_allowance_threshold) > 0 && allowance.dailyAllowance < Number(settings.low_allowance_threshold)) {
        reasons.push(`Your safe-to-spend has dropped below your alert threshold.`);
      }

      const atRiskGoals = snapshot.goals.filter((g) => {
        if (!g.target_date) return false;
        const daysLeft = (new Date(g.target_date).getTime() - snapshot.today.getTime()) / 86_400_000;
        return daysLeft <= 30 && daysLeft >= 0 && g.saved_amount < g.target_amount;
      });
      for (const goal of atRiskGoals) {
        reasons.push(`"${goal.name}" is due soon and still needs ${(goal.target_amount - goal.saved_amount).toFixed(2)} more.`);
      }

      if (reasons.length > 0 && (await shouldSend(admin, settings.user_id, "budget_alert"))) {
        const email = budgetAlertEmail(snapshot, profile.currency, profile.display_name, reasons);
        if (await deliver(resend, fromAddress, settings.email, email)) {
          await logAlert(admin, settings.user_id, "budget_alert", { reasons });
          sent.push("budget_alert");
        }
      }
    }

    results.push({ user_id: settings.user_id, sent });
  }

  return NextResponse.json({ checked: results.length, results });
}

async function shouldSend(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  alertType: string
): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { data } = await admin
    .from("alert_log")
    .select("id")
    .eq("user_id", userId)
    .eq("alert_type", alertType)
    .gte("sent_at", startOfDay.toISOString())
    .limit(1);
  return !data || data.length === 0;
}

async function logAlert(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  alertType: string,
  details?: Record<string, unknown>
) {
  await admin.from("alert_log").insert({ user_id: userId, alert_type: alertType, details: details ?? null });
}

async function deliver(
  resend: Resend | null,
  from: string,
  to: string,
  email: { subject: string; html: string }
): Promise<boolean> {
  if (!resend) return false;
  try {
    await resend.emails.send({ from, to, subject: email.subject, html: email.html });
    return true;
  } catch {
    return false;
  }
}
