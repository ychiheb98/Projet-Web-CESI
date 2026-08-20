import { formatCurrency } from "@/lib/budget-engine";
import type { BudgetSnapshot } from "@/lib/dashboard-data";

const wrap = (title: string, bodyHtml: string) => `
<div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
  <h1 style="font-size: 20px; margin: 0 0 12px;">${title}</h1>
  ${bodyHtml}
  <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
    You're getting this because email alerts are enabled in your Budget app settings. You can turn them off any time.
  </p>
</div>`;

export function dailyDigestEmail(snapshot: BudgetSnapshot, currency: string, name: string | null) {
  const { allowance } = snapshot;
  const greeting = name ? `Hi ${name},` : "Hi,";
  return {
    subject: `Today's safe-to-spend: ${formatCurrency(allowance.dailyAllowance, currency)}`,
    html: wrap(
      "Your daily budget",
      `
      <p>${greeting}</p>
      <p style="font-size: 28px; font-weight: 600; margin: 16px 0;">${formatCurrency(allowance.dailyAllowance, currency)}</p>
      <p>That's what you can spend today and stay on plan, with ${allowance.daysLeftIncludingToday} days left in the month.</p>
      <p>So far this month: ${formatCurrency(snapshot.spentThisMonth, currency)} of ${formatCurrency(snapshot.overallBudget, currency)}.</p>
      `
    ),
  };
}

export function budgetAlertEmail(
  snapshot: BudgetSnapshot,
  currency: string,
  name: string | null,
  reasons: string[]
) {
  const { allowance } = snapshot;
  const greeting = name ? `Hi ${name},` : "Hi,";
  return {
    subject: "⚠️ Your budget needs attention",
    html: wrap(
      "Heads up",
      `
      <p>${greeting}</p>
      <ul>${reasons.map((r) => `<li style="margin-bottom: 6px;">${r}</li>`).join("")}</ul>
      <p>Safe to spend for the rest of today: <strong>${formatCurrency(allowance.dailyAllowance, currency)}</strong> (${allowance.daysLeftIncludingToday} days left this month).</p>
      `
    ),
  };
}
