import { XIcon } from "lucide-react";
import React, { useState } from "react";
import { Goal } from "../../types/goal.types";

interface GoalModalProps {
  closeModal: () => void;
  goal: Goal;
  progress: number;
  monthsLeft: number;
  priority: { label: string; dot: string; text: string; bg: string };
  onTrack: boolean;
  projectedShortfall: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const GoalModal = ({
  closeModal,
  goal,
  progress,
  monthsLeft,
  priority,
  onTrack,
  projectedShortfall,
}: GoalModalProps) => {
  const [formData, setFormData] = useState({
    name: goal.name,
    description: goal.description,
    targetAmount: goal.targetAmount,
    targetDate: goal.targetDate,
    priority: goal.priority,
    monthlyContribution: goal.monthlyContribution,
    currentAmount: goal.currentAmount,
    startDate: goal.startDate,
  });

  const [amount, setAmount] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // api call to update goal with formData

    // Verify if any changes were made
    const mimicGoal = {
      id: goal.id,
      ...formData,
    };

    console.log("Mimic", mimicGoal);

    console.log("Original", goal);

    const hasChanges = Object.keys(formData).some(
      (key) =>
        formData[key as keyof typeof formData] !== goal[key as keyof Goal],
    );

    if (!hasChanges) {
      console.log("No changes detected");
      closeModal();
      return;
    }

    console.log("Updated goal:", formData);
    closeModal();
  };

  const handleContribute = () => {
    // api call to contribute amount to goal
    postMessage({
      type: "contribute_goal",
      data: { id: goal.id, amount: Number(amount) },
    });
    setAmount(0);
  };

  const handleDelete = () => {
    // api call to delete goal
    postMessage({ type: "delete_goal", data: goal.id });
    closeModal();
  };

  const clampedProgress = Math.min(100, progress);

  return (
    <div
      className="w-full h-screen bg-black/40 backdrop-blur-sm fixed top-0 left-0 flex items-center justify-center p-4 z-50"
      onClick={closeModal}
    >
      <div
        className="w-4/5 h-4/5 bg-white rounded-2xl shadow-2xl relative flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left panel — stats */}
        <div className="w-72 bg-zinc-950 text-white flex flex-col p-7 gap-6">
          {/* Goal name & status */}
          <div className="mt-6">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${priority.bg} ${priority.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label} priority
            </div>
            <h3 className="text-xl font-serifDisplay leading-tight">
              {goal.name}
            </h3>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
              {goal.description}
            </p>
          </div>

          {/* Progress ring / bar */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">
                Progress
              </span>
              <span className="text-sm font-semibold text-white">
                {Math.round(clampedProgress)}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  clampedProgress >= 100
                    ? "bg-emerald-400"
                    : clampedProgress >= 60
                      ? "bg-blue-400"
                      : "bg-amber-400"
                }`}
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-zinc-500">
                {formatCurrency(goal.currentAmount)}
              </span>
              <span className="text-xs text-zinc-500">
                {formatCurrency(goal.targetAmount)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-3">
            <div className="bg-zinc-900 rounded-xl p-3.5">
              <p className="text-xs text-zinc-500 mb-0.5">
                Monthly contribution
              </p>
              <p className="text-lg font-semibold">
                +{formatCurrency(goal.monthlyContribution)}
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-3.5">
              <p className="text-xs text-zinc-500 mb-0.5">Time remaining</p>
              <p className="text-lg font-semibold">
                {monthsLeft} <span className="text-sm font-normal">months</span>
              </p>
            </div>
            <div
              className={`rounded-xl p-3.5 ${onTrack ? "bg-emerald-950" : "bg-rose-950"}`}
            >
              <p
                className={`text-xs mb-0.5 ${onTrack ? "text-emerald-500" : "text-rose-400"}`}
              >
                Status
              </p>
              <p
                className={`text-sm font-semibold ${onTrack ? "text-emerald-300" : "text-rose-300"}`}
              >
                {onTrack
                  ? "On track"
                  : `${formatCurrency(Math.abs(projectedShortfall))} projected shortfall`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs font-medium text-zinc-500">
              Update Amount
            </label>

            <div className="flex gap-2 relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                $
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={goal.currentAmount}
                onChange={(e) => setAmount(e.target.valueAsNumber)}
                className="flex-1 border border-zinc-200 rounded-lg pl-4 py-1.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400"
                placeholder={`Suggested: $${goal.monthlyContribution}`}
              />
            </div>
            <button
              onClick={handleContribute}
              disabled={!amount || amount <= 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-0"
            >
              Update amount
            </button>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-7 pb-5 border-b border-zinc-100">
            <div>
              <h2 className="text-3xl font-serifDisplay text-zinc-900 leading-tight">
                Goal Details
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                View and edit the details of your goal.
              </p>
            </div>
            <button
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors shadow-sm mt-1"
              onClick={closeModal}
            >
              <XIcon className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-7 flex-1"
          >
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Goal Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-300"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none placeholder:text-zinc-300"
              />
            </div>

            {/* Target Amount + Target Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Target Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    className="w-full border border-zinc-200 rounded-lg pl-7 pr-3.5 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Monthly Contribution
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="monthlyContribution"
                    value={formData.monthlyContribution}
                    onChange={handleChange}
                    className="w-full border border-zinc-200 rounded-lg pl-7 pr-3.5 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all appearance-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Start Date + Monthly Contribution */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Target Date
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 mt-auto border-t border-zinc-100">
              <button
                type="button"
                className="text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors"
              >
                Delete goal
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Save changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
