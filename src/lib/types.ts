export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  currency: string;
  timezone: string;
  created_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_income: boolean;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  occurred_on: string;
  note: string | null;
  source: "manual" | "import";
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string | null;
  month: string;
  amount: number;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  priority: number;
  archived: boolean;
  created_at: string;
};

export type GoalContribution = {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  occurred_on: string;
  created_at: string;
};

export type RecurringBill = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_day: number;
  active: boolean;
  created_at: string;
};

export type AlertSettings = {
  user_id: string;
  email: string;
  daily_digest: boolean;
  overspend_alerts: boolean;
  overspend_threshold_pct: number;
  low_allowance_threshold: number;
  updated_at: string;
};

export type AlertLog = {
  id: string;
  user_id: string;
  alert_type: string;
  sent_at: string;
  details: Record<string, unknown> | null;
};

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Partial<Profile> & { id: string; email: string }>;
      categories: Table<Category, Partial<Category> & { user_id: string; name: string }>;
      expenses: Table<Expense, Partial<Expense> & { user_id: string; amount: number }>;
      budgets: Table<Budget, Partial<Budget> & { user_id: string; month: string; amount: number }>;
      goals: Table<Goal, Partial<Goal> & { user_id: string; name: string; target_amount: number }>;
      goal_contributions: Table<GoalContribution, Partial<GoalContribution> & { user_id: string; goal_id: string; amount: number }>;
      recurring_bills: Table<RecurringBill, Partial<RecurringBill> & { user_id: string; name: string; amount: number; due_day: number }>;
      alert_settings: Table<AlertSettings, Partial<AlertSettings> & { user_id: string; email: string }>;
      alert_log: Table<AlertLog, Partial<AlertLog> & { user_id: string; alert_type: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
