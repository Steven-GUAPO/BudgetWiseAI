import React, { useState } from "react";
import { Goal } from "../../types/goal.types";
import GoalModal from "./GoalModal";
import { formatCurrency } from "utils/formatCurrency";
import { formatDate } from "utils/formatDate";

interface GoalCardProps {
  goal: Goal;
  progress: number;
  monthsLeft: number;
  priority: { label: string; dot: string; text: string; bg: string };
  onTrack: boolean;
  projectedShortfall: number;
}

const GoalCard = ({
  goal,
  progress,
  monthsLeft,
  priority,
  onTrack,
  projectedShortfall,
}: GoalCardProps) => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <div
      key={goal.id}
      className="bg-white border border-zinc-100 shadow-sm rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div>
            <h2 className="font-serifBody font-semibold text-zinc-900 leading-tight">
              {goal.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">{goal.description}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium shrink-0 ${priority.bg} ${priority.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-xs text-zinc-700">Progress</span>
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
          <span className="text-zinc-800 font-medium">
            {formatDate(goal.targetDate, { month: "short", year: "numeric" })}
          </span>
          {monthsLeft > 0 && (
            <span className="text-zinc-400"> · {monthsLeft}mo left</span>
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

      {/* Contribute */}
      <button className="mt-2 btn-primary" onClick={() => setOpenModal(true)}>
        Contribute
      </button>
      {/* Modal */}
      {openModal && (
        <GoalModal
          closeModal={() => setOpenModal(false)}
          goal={goal}
          progress={progress}
          monthsLeft={monthsLeft}
          priority={priority}
          onTrack={onTrack}
          projectedShortfall={projectedShortfall}
        />
      )}
    </div>
  );
};

export default GoalCard;
