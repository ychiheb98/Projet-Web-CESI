import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),
  category_id: z.string().uuid().nullable().optional(),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(280).optional().nullable(),
});

export const importedExpenseSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(280).optional().nullable(),
  category_name: z.string().max(60).optional().nullable(),
});

export const csvImportSchema = z.array(importedExpenseSchema).max(2000);

export const categorySchema = z.object({
  name: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().min(1).max(40),
  is_income: z.boolean().optional(),
});

export const budgetSchema = z.object({
  category_id: z.string().uuid().nullable(),
  month: z.string().regex(/^\d{4}-\d{2}-01$/),
  amount: z.coerce.number().min(0).max(1_000_000),
});

export const goalSchema = z.object({
  name: z.string().min(1).max(80),
  target_amount: z.coerce.number().positive().max(10_000_000),
  saved_amount: z.coerce.number().min(0).max(10_000_000).default(0),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  priority: z.coerce.number().int().min(0).max(100).default(0),
});

export const goalContributionSchema = z.object({
  goal_id: z.string().uuid(),
  amount: z.coerce.number().positive().max(1_000_000),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const recurringBillSchema = z.object({
  name: z.string().min(1).max(80),
  amount: z.coerce.number().positive().max(1_000_000),
  due_day: z.coerce.number().int().min(1).max(28),
});

export const alertSettingsSchema = z.object({
  email: z.string().email(),
  daily_digest: z.boolean(),
  overspend_alerts: z.boolean(),
  overspend_threshold_pct: z.coerce.number().min(100).max(300),
  low_allowance_threshold: z.coerce.number().min(0).max(1_000_000),
});

export const profileSchema = z.object({
  display_name: z.string().max(80).nullable().optional(),
  currency: z.string().length(3),
  timezone: z.string().min(1).max(80),
});
