export interface Goal {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: "high" | "medium" | "low";
  is_completed: boolean;
  percentage_complete: number;
  percentage_completed?: number;
  days_remaining: number;
  monthly_deposit_needed: number;
}

export interface GoalCreate {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  priority?: "low" | "medium" | "high";
  initial_deposit?: number;
}

export interface GoalUpdate {
  name?: string;
  description?: string;
  target_amount?: number;
  target_date?: string;
  priority?: "low" | "medium" | "high";
}

export interface GoalDeposit {
  amount: number;
}

export interface GoalSummary {
  active_goals: number;
  completed_goals: number;
  total_target: number;
  total_saved: number;
  total_remaining: number;
  percentage_complete: number;
}