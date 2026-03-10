import React from "react";
import { Budget } from "../../types/budget.types";

interface BudgetCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budgetId: string) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
  const getProgressColor = () => {
    if (budget.is_over_budget) return "bg-red-500";
    if (budget.percentage_used >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div style={{
      backgroundColor: "#2a2a3e",
      borderRadius: "12px",
      padding: "20px",
      border: `2px solid ${budget.is_over_budget ? "#EF4444" : "#4a4a4a"}`,
  }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "start",
      marginBottom: "12px",
    }}>
    <div> <h3 style={{
      color: "#ffffff", 
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "4px",
    }}>
      {budget.category}
      </h3>
      <p style={{
        color: "#a0a0a0",
        fontSize: "14px",
      }}>
        {budget.month} {budget.year}
      </p>
      </div>
      <div style={{
        display: "flex",
        gap: "8px",
      }}>
        {onEdit && (
          <button
            onClick={() => onEdit(budget)}
            style={{
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
            }}>
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(budget.id)}
            style={{
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
            }}
          >
            Delete
          </button>
        )}
      </div>
  </div>  

        <div style ={{
          marginBottom: "12px",
        }}>
          <div style={{ 
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}>
            <span style={{
              color: "#a0a0a0",
              fontSize: "14px",
            }}>
              ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
            </span>
            </div>

          <div style={{
             width: '100%',
          height: '8px',
          backgroundColor: '#1a1a2e',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(budget.percentage_used, 100)}%`,
            height: '100%',
            backgroundColor: getProgressColor(),
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {budget.is_over_budget && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          padding: '8px 12px',
          borderRadius: '6px',
          marginTop: '12px',
        }}>
          <p style={{ 
            color: '#EF4444', 
            fontSize: '13px', 
            margin: 0
           }}>
            Over budget by ${(budget.spent - budget.limit).toFixed(2)}
          </p>
        </div>
      )}

      {!budget.is_over_budget && budget.remaining > 0 && (
        <p style={{ 
          color: '#10B981', 
          fontSize: '13px', 
          marginTop: '12px' 
          }}>
          ${budget.remaining.toFixed(2)} remaining
        </p>
      )}
    </div>
  );
};

export default BudgetCard;