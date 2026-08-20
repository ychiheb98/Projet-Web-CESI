import type { Goal, RecurringBill } from "@/lib/types";

export type DailyAllowanceInput = {
  monthlyBudget: number;
  spentThisMonth: number;
  today: Date;
  upcomingBills: number;
  requiredMonthlySavings: number;
};

export type DailyAllowanceResult = {
  daysInMonth: number;
  dayOfMonth: number;
  daysLeftIncludingToday: number;
  reserved: number;
  availableToSpend: number;
  dailyAllowance: number;
  expectedSpendByToday: number;
  paceDelta: number;
  paceStatus: "ahead" | "on_track" | "behind";
};

// The whole app hinges on this number, so it stays a plain formula instead of
// an LLM call: remaining budget, minus money already earmarked for bills and
// goal savings, spread over the days left in the month. AI only narrates it.
export function computeDailyAllowance(input: DailyAllowanceInput): DailyAllowanceResult {
  const { monthlyBudget, spentThisMonth, today, upcomingBills, requiredMonthlySavings } = input;

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const daysLeftIncludingToday = daysInMonth - dayOfMonth + 1;

  const reserved = Math.max(upcomingBills, 0) + Math.max(requiredMonthlySavings, 0);
  const availableToSpend = Math.max(monthlyBudget - spentThisMonth - reserved, 0);
  const dailyAllowance = daysLeftIncludingToday > 0 ? availableToSpend / daysLeftIncludingToday : 0;

  const expectedSpendByToday = monthlyBudget * (dayOfMonth / daysInMonth);
  const paceDelta = spentThisMonth - expectedSpendByToday;
  // within 3% of the straight-line plan counts as "on track" rather than flagging noise
  const paceTolerance = monthlyBudget * 0.03;
  const paceStatus: DailyAllowanceResult["paceStatus"] =
    paceDelta > paceTolerance ? "behind" : paceDelta < -paceTolerance ? "ahead" : "on_track";

  return {
    daysInMonth,
    dayOfMonth,
    daysLeftIncludingToday,
    reserved,
    availableToSpend,
    dailyAllowance: round2(dailyAllowance),
    expectedSpendByToday: round2(expectedSpendByToday),
    paceDelta: round2(paceDelta),
    paceStatus,
  };
}

function monthsBetween(from: Date, to: Date): number {
  if (to < from) return 0;
  return Math.max((to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()), 1);
}

// A goal with a target date needs this much saved *this* month to stay on
// pace; a goal whose date has already passed needs everything remaining now.
export function requiredMonthlyContribution(goal: Pick<Goal, "target_amount" | "saved_amount" | "target_date">, today: Date): number {
  const remaining = Math.max(goal.target_amount - goal.saved_amount, 0);
  if (remaining <= 0 || !goal.target_date) return 0;

  const months = monthsBetween(today, new Date(goal.target_date));
  if (months <= 0) return remaining;
  return remaining / months;
}

export function sumRequiredMonthlySavings(goals: Goal[], today: Date): number {
  return goals
    .filter((g) => !g.archived)
    .reduce((sum, g) => sum + requiredMonthlyContribution(g, today), 0);
}

// Bills due later this month are treated as still-owed; bills whose due day
// has already passed are assumed paid. This is a simplification — there's no
// "paid" flag yet — but keeps the reserve honest without extra bookkeeping.
export function sumUpcomingBills(bills: RecurringBill[], today: Date): number {
  const dayOfMonth = today.getDate();
  return bills
    .filter((b) => b.active && b.due_day >= dayOfMonth)
    .reduce((sum, b) => sum + b.amount, 0);
}

export function paceMessage(result: DailyAllowanceResult, currency: string): string {
  const fmt = (n: number) => formatCurrency(n, currency);
  if (result.paceStatus === "behind") {
    return `You're ${fmt(result.paceDelta)} ahead of your planned pace this month. Spend about ${fmt(result.dailyAllowance)}/day for the rest of the month to land back on budget.`;
  }
  if (result.paceStatus === "ahead") {
    return `You're ${fmt(Math.abs(result.paceDelta))} under your planned pace. You can spend up to ${fmt(result.dailyAllowance)}/day and stay on track.`;
  }
  return `You're on track. Keep spending at or below ${fmt(result.dailyAllowance)}/day for the rest of the month.`;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(amount);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
