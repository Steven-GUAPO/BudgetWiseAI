import { Goal } from "../../types/goal.types";
import React from "react";
import GoalCard from "./GoalCard";

interface GoalListProps {
  sortedGoals: Goal[];
}

const priorityConfig = {
  high: {
    label: "High",
    dot: "bg-rose-500",
    text: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-400",
    text: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  low: {
    label: "Low",
    dot: "bg-emerald-400",
    text: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
};

const getMonthsRemaining = (targetDate: string) => {
  const now = new Date();
  const target = new Date(targetDate);
  return Math.max(
    0,
    (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth()),
  );
};

const GoalList = ({ sortedGoals }: GoalListProps) => {
  return (
    <div className="flex flex-col gap-3">
      {sortedGoals.map((goal) => {
        const progress = Math.min(
          100,
          (goal.currentAmount / goal.targetAmount) * 100,
        );
        const remaining = goal.targetAmount - goal.currentAmount;
        const monthsLeft = getMonthsRemaining(goal.targetDate);
        const priority =
          priorityConfig[goal.priority as keyof typeof priorityConfig];
        const projectedShortfall =
          monthsLeft > 0
            ? remaining - (goal.monthlyContribution ?? 0) * monthsLeft
            : 0;
        const onTrack = projectedShortfall <= 0;

        return (
          <GoalCard
            key={goal.id}
            goal={goal}
            progress={progress}
            monthsLeft={monthsLeft}
            priority={priority}
            onTrack={onTrack}
            projectedShortfall={projectedShortfall}
          />
        );
      })}
    </div>
  );
};

export default GoalList;
