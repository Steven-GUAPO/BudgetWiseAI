import React, { useState, useMemo } from "react";
import { mockGoals } from "data/mockGoals";

const priorityOrder = { high: 0, medium: 1, low: 2 };

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

const typeConfig = {
  savings: { icon: "🏦", label: "Savings" },
  investment: { icon: "📈", label: "Investment" },
  debt: { icon: "💳", label: "Debt" },
  purchase: { icon: "🛍️", label: "Purchase" },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

const getMonthsRemaining = (targetDate: string) => {
  const now = new Date();
  const target = new Date(targetDate);
  return Math.max(
    0,
    (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth()),
  );
};

const Goals = () => {
  const [sortBy, setSortBy] = useState("priority");

  const sortedGoals = useMemo(() => {
    return [...mockGoals].sort((a, b) => {
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder];
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder];
      return pa - pb;
      if (sortBy === "targetDate")
        return (
          new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
        );
      if (sortBy === "currentAmount") return b.currentAmount - a.currentAmount;
      return 0;
    });
  }, [sortBy]);

  return (
    <div className="py-8 px-4 gap-6 flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title font-serifDisplay">Goals</h1>
        <span className="text-sm text-zinc-400 font-medium">
          {mockGoals.length} total
        </span>
      </div>

      {/* Sort Control */}
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
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
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

      {/* Goal Cards */}
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
          const type = typeConfig[goal.type] ?? {
            icon: "🎯",
            label: goal.type,
          };
          const projectedShortfall =
            monthsLeft > 0
              ? remaining - (goal.monthlyContribution ?? 0) * monthsLeft
              : 0;
          const onTrack = projectedShortfall <= 0;

          return (
            <div
              key={goal.id}
              className="bg-white border border-zinc-100 shadow-sm rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">
                    {type.icon}
                  </span>
                  <div>
                    <h2 className="font-serifBody font-semibold text-zinc-900 leading-tight">
                      {goal.name}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {goal.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium shrink-0 ${priority.bg} ${priority.text}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${priority.dot}`}
                  />
                  {priority.label}
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs text-zinc-500">Progress</span>
                  <span className="text-xs font-semibold text-zinc-700">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progress >= 100
                        ? "bg-emerald-500"
                        : progress >= 60
                          ? "bg-blue-500"
                          : "bg-amber-400"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-zinc-400 mb-0.5">Saved</p>
                  <p className="text-sm font-semibold text-zinc-800">
                    {formatCurrency(goal.currentAmount)}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-zinc-400 mb-0.5">Target</p>
                  <p className="text-sm font-semibold text-zinc-800">
                    {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-zinc-400 mb-0.5">Monthly</p>
                  <p className="text-sm font-semibold text-zinc-800">
                    +{formatCurrency(goal.monthlyContribution)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                <span className="text-xs text-zinc-400">
                  Target:{" "}
                  <span className="text-zinc-600 font-medium">
                    {formatDate(goal.targetDate)}
                  </span>
                  {monthsLeft > 0 && (
                    <span className="text-zinc-400">
                      {" "}
                      · {monthsLeft}mo left
                    </span>
                  )}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    onTrack
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-500"
                  }`}
                >
                  {onTrack
                    ? "✓ On track"
                    : `${formatCurrency(Math.abs(projectedShortfall))} short`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
