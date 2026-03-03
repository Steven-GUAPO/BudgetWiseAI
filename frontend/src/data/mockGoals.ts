interface Goal {
  id: string;
  name: string;
  description: string;
  type: "savings" | "debt" | "investment";
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  monthlyContribution: number;
  status: "active" | "completed" | "paused";
  priority: "high" | "medium" | "low";
}

export const mockGoals: Goal[] = [
  {
    id: "g1",
    name: "Emergency Fund",
    description: "Build a 6-month emergency fund for unexpected expenses.",
    type: "savings",
    targetAmount: 12000,
    currentAmount: 4800,
    startDate: "2026-01-01",
    targetDate: "2026-12-31",
    monthlyContribution: 1000,
    status: "active",
    priority: "high",
  },
  {
    id: "g2",
    name: "Hawaii Vacation",
    description: "Save for flights, hotel, and activities for summer trip.",
    type: "savings",
    targetAmount: 3500,
    currentAmount: 1200,
    startDate: "2026-02-01",
    targetDate: "2026-07-01",
    monthlyContribution: 600,
    status: "active",
    priority: "medium",
  },
  {
    id: "g3",
    name: "Pay Off Credit Card",
    description: "Eliminate high-interest credit card debt.",
    type: "debt",
    targetAmount: 4200,
    currentAmount: 3100,
    startDate: "2025-12-01",
    targetDate: "2026-05-01",
    monthlyContribution: 800,
    status: "active",
    priority: "high",
  },
  {
    id: "g4",
    name: "New Car Down Payment",
    description: "Save for a 20% down payment on a new car.",
    type: "savings",
    targetAmount: 8000,
    currentAmount: 8000,
    startDate: "2025-01-01",
    targetDate: "2026-01-01",
    monthlyContribution: 700,
    status: "completed",
    priority: "high",
  },
  {
    id: "g5",
    name: "Invest in Index Fund",
    description: "Invest consistently into S&P 500 index fund.",
    type: "investment",
    targetAmount: 10000,
    currentAmount: 3500,
    startDate: "2026-01-01",
    targetDate: "2026-12-31",
    monthlyContribution: 800,
    status: "active",
    priority: "medium",
  },
];
