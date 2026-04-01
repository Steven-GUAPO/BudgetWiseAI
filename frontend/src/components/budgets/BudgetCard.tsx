import React from "react";
import { Budget } from "../../types/budget.types";

interface BudgetCardProps {
  budget: Budget;
  cat_color: string;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

const ProgressBar: React.FC<{ pct: number; colorClass: string }> = ({
  pct,
  colorClass,
}) => (
  <div className="w-full h-1.5 bg-[#0d1f15] rounded-full">
    <div
      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
  </div>
);

const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  cat_color,
  onEdit,
  onDelete,
}) => {
  const getProgressColor = (budget: Budget) => {
    if (budget.is_over_budget) return "#EF4444";
    if (budget.percentage_used > 80) return "#F59E0B";
    return "#10B981";
  };

  return (
    <div
      key={budget.id}
      style={{
        background: "#0c1a0f",
        borderRadius: "10px",
        padding: "12px",
        border: `1px solid ${budget.is_over_budget ? "rgba(239,68,68,0.35)" : "rgba(52,211,153,0.08)"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "12px",
        }}
      >
        <div>
          <p
            style={{
              color: cat_color,
              fontSize: "16px",
              fontWeight: 600,
              margin: 0,
            }}
          >
            {budget.category}
          </p>
          <p
            style={{
              color: "#4b7a64",
              fontSize: "11px",
              margin: "3px 0 0",
            }}
          >
            {budget.month} {budget.year}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onEdit(budget)}
            style={{
              background: "none",
              color: "#34d399",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 500,
              padding: "5px 10px",
              borderRadius: "4px",
              border: "1px solid gray",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            style={{
              background: "none",
              color: "#f87171",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 500,
              padding: "5px 10px",
              borderRadius: "4px",
              border: "1px solid gray",
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <span style={{ color: "#4b7a64", fontSize: "12px" }}>
          ${budget.spent.toFixed(0)} / ${budget.limit.toFixed(0)}
        </span>
        <span
          style={{
            color: getProgressColor(budget),
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {budget.percentage_used.toFixed()}%
        </span>
      </div>
      <ProgressBar
        pct={budget.percentage_used}
        colorClass={
          budget.is_over_budget
            ? "bg-red-500"
            : budget.percentage_used > 80
              ? "bg-amber-400"
              : "bg-emerald-400"
        }
      />
      <p
        style={{
          color: budget.is_over_budget ? "#f87171" : "#34d399",
          fontSize: "11px",
          margin: "8px 0 0",
        }}
      >
        {budget.is_over_budget
          ? `Over by $${(budget.spent - budget.limit).toFixed(2)}`
          : `$${budget.remaining.toFixed(0)} remaining`}
      </p>
    </div>
  );
};

export default BudgetCard;
