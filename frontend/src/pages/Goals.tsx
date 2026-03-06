import React, { useState, useMemo } from "react";
import { mockGoals } from "data/mockGoals";
import GoalList from "../components/goals/GoalList";

const priorityOrder = { high: 0, medium: 1, low: 2 };

const Goals = () => {
  const [sortBy, setSortBy] = useState("priority");

  const sortedGoals = useMemo(() => {
    return [...mockGoals].sort((a, b) => {
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder];
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder];

      if (sortBy === "priority") return pa - pb;
      if (sortBy === "targetDate")
        return (
          new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
        );
      if (sortBy === "currentAmount") return b.currentAmount - a.currentAmount; // descending

      return 0; // fallback — preserve original order
    });
  }, [sortBy]);

  return (
    <div className="py-8 px-4 gap-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title font-serifDisplay">Goals</h1>
      </div>

      {/* Sort Control */}
      <div className="flex items-center justify-between text-sm">
        <h2 className="text-sm text-zinc-400">{mockGoals.length} total</h2>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Sort by</span>
          <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
            {[
              { value: "priority", label: "Priority" },
              { value: "targetDate", label: "Target Date" },
              { value: "currentAmount", label: "Amount" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1 rounded-md text-sm font-serifDisplay font-extralight transition-all ${
                  sortBy === opt.value
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Cards */}
      <GoalList sortedGoals={sortedGoals} />
    </div>
  );
};

export default Goals;
