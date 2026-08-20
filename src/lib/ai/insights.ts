"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getUserBudgetSnapshot } from "@/lib/dashboard-data";

export type AiInsightResult = { ok: true; message: string } | { ok: false; error: string };

// The daily allowance itself is always the deterministic budget-engine
// number — this only asks Claude to narrate already-computed figures, and
// explicitly forbids inventing new ones. Expense notes are never sent, only
// category names and aggregate totals.
export async function getAiInsight(): Promise<AiInsightResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "AI insights aren't set up yet — add ANTHROPIC_API_KEY to your environment." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
  const currency = profile?.currency ?? "USD";
  const timezone = profile?.timezone ?? "UTC";

  const snapshot = await getUserBudgetSnapshot(supabase, auth.user.id, timezone);

  const categoryBreakdown = snapshot.categories
    .map((c) => ({
      name: c.name,
      spent: snapshot.spentByCategory.get(c.id) ?? 0,
      budget: snapshot.categoryBudgets.find((b) => b.category_id === c.id)?.amount ?? null,
    }))
    .filter((c) => c.spent > 0 || c.budget !== null);

  const goalSummaries = snapshot.goals.map((g) => ({
    name: g.name,
    target: g.target_amount,
    saved: g.saved_amount,
    targetDate: g.target_date,
  }));

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 250,
      system:
        "You are a terse, encouraging personal budget coach. You are given already-computed numbers for the user's current month — never invent or recompute numbers, only explain and advise using the ones given. Write 2-4 short plain-language sentences, no markdown, no bullet points.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            currency,
            monthlyBudget: snapshot.overallBudget,
            spentThisMonth: snapshot.spentThisMonth,
            dailyAllowance: snapshot.allowance.dailyAllowance,
            daysLeftInMonth: snapshot.allowance.daysLeftIncludingToday,
            paceStatus: snapshot.allowance.paceStatus,
            reservedForBillsAndGoals: snapshot.allowance.reserved,
            categoryBreakdown,
            goals: goalSummaries,
          }),
        },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join(" ")
      .trim();

    return { ok: true, message: text || "No insight available right now." };
  } catch {
    return { ok: false, error: "Couldn't reach the AI coach right now — try again shortly." };
  }
}
