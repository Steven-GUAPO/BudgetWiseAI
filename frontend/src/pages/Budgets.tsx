import React, { useState, useEffect, useMemo } from "react";
import budgetService from "../services/budget.service";
import { Budget, BudgetCreate } from "../types/budget.types";
import { Chart, ArcElement, Tooltip, DoughnutController } from "chart.js";
import BudgetCard from "components/budgets/BudgetCard";
import { formatCurrency } from "utils/formatCurrency";

// Must register Chart.js components before using in order for the charts to render
Chart.register(ArcElement, Tooltip, DoughnutController);

const CATEGORIES = [
  "Groceries",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Dining",
  "Bills",
  "Healthcare",
  "Education",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#34d399", // emerald — fresh/food
  Transportation: "#38bdf8", // sky blue — movement
  Entertainment: "#a78bfa", // violet — leisure
  Shopping: "#f472b6", // pink — retail
  Dining: "#fb923c", // orange — food/warmth
  Bills: "#94a3b8", // slate — neutral/utility
  Healthcare: "#f87171", // red — medical
  Education: "#facc15", // yellow — knowledge
  Other: "#4b7a64", // muted green — matches app's base tone
};

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    limit: "",
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (!budgets.length) return;
    const canvas = document.getElementById("budgetPie") as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    new Chart(canvas, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [
              ...budgets.map((b) => b.spent),
              Math.max(0, totalMonthlyBudget - totalMonthlySpent),
            ],
            backgroundColor: [
              ...budgets.map((b) => CATEGORY_COLORS[b.category] || "#6b7280"),
              "rgba(255,255,255,0.06)",
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: false,
        cutout: "68%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    });
  }, [budgets]);

  const { totalMonthlyBudget, totalMonthlySpent, budgetPct, isOverBudget } =
    useMemo(() => {
      const spent = budgets.reduce((s, b) => s + b.spent, 0);
      const limit = budgets.reduce((s, b) => s + b.limit, 0);
      return {
        totalMonthlyBudget: limit,
        totalMonthlySpent: spent,
        budgetPct: limit ? Math.min((spent / limit) * 100, 100) : 0,
        isOverBudget: spent > limit,
      };
    }, [budgets]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (err: any) {
      setError("Failed to load budgets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    setError("");

    if (!formData.category || !formData.limit) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const budgetData: BudgetCreate = {
        category: formData.category,
        limit: parseFloat(formData.limit),
      };

      await budgetService.createBudget(budgetData);
      setShowCreateModal(false);
      setFormData({ category: "", limit: "" });
      fetchBudgets();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create budget");
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget) return;

    try {
      await budgetService.updateBudget(editingBudget.id, {
        limit: parseFloat(formData.limit),
      });
      setEditingBudget(null);
      setFormData({ category: "", limit: "" });
      setShowCreateModal(false);
      fetchBudgets();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update budget");
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;

    try {
      await budgetService.deleteBudget(id);
      fetchBudgets();
    } catch (err: any) {
      setError("Failed to delete budget");
    }
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingBudget(null);
    setFormData({ category: "", limit: "" });
    setError("");
  };

  const getProgressColor = (budget: Budget) => {
    if (budget.is_over_budget) return "#EF4444";
    if (budget.percentage_used > 80) return "#F59E0B";
    return "#10B981";
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#ffffff", fontSize: "20px" }}>Loading budgets...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 10px",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                color: "#ffffff",
                fontSize: "32px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              Budgets
            </h1>
            <p style={{ color: "#a0a0a0", fontSize: "16px", marginTop: "8px" }}>
              Track your spending limits by category
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: "#0a110e",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Create Budget
          </button>
        </div>

        {budgets.length === 0 && (
          <div
            style={{
              backgroundColor: "#0a110e",
              borderRadius: "12px",
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>💰</div>
            <h3
              style={{
                color: "#ffffff",
                fontSize: "24px",
                marginBottom: "12px",
              }}
            >
              No budgets yet
            </h3>
            <p
              style={{
                color: "#a0a0a0",
                fontSize: "16px",
                marginBottom: "24px",
              }}
            >
              Create your first budget to start tracking your spending
            </p>
          </div>
        )}

        {/* ── Overview widget ── */}
        <div className="bg-[#0c1a0f] rounded-xl border border-emerald-400/[0.08] p-5 mb-4">
          <p className="text-[#4b7a64] text-xs font-semibold uppercase tracking-widest mb-4">
            Overview —{" "}
            {new Date().toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Summary stat pills */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              {
                label: "Total budget",
                value: `${formatCurrency(totalMonthlyBudget, "en-US", "USD", 2)}`,
                color: "#f0fdf4",
              },
              {
                label: "Total spent",
                value: `${formatCurrency(totalMonthlySpent, "en-US", "USD", 2)}`,
                color: isOverBudget ? "#f87171" : "#f0fdf4",
              },
              {
                label: "Remaining",
                value: `${formatCurrency(Math.max(0, totalMonthlyBudget - totalMonthlySpent), "en-US", "USD", 2)}`,
                color: "#34d399",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <p
                  style={{
                    color: "#4b7a64",
                    fontSize: "11px",
                    margin: "0 0 4px",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    color: s.color,
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Donut + legend */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div
              style={{
                position: "relative",
                width: "160px",
                height: "160px",
                flexShrink: 0,
              }}
            >
              <canvas id="budgetPie" width="160" height="160" />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <p
                  style={{
                    color: "#f0fdf4",
                    fontSize: "18px",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {budgetPct.toFixed(0)}%
                </p>
                <p style={{ color: "#4b7a64", fontSize: "10px", margin: 0 }}>
                  used
                </p>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {budgets.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: CATEGORY_COLORS[b.category] || "#6b7280",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ color: "#d1fae5", fontSize: "12px" }}>
                      {b.category}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#4b7a64", fontSize: "11px" }}>
                      ${b.spent.toFixed(2)}
                    </span>
                    <span
                      style={{
                        color: CATEGORY_COLORS[b.category],
                        fontSize: "11px",
                        fontWeight: 600,
                        minWidth: "28px",
                        textAlign: "right",
                      }}
                    >
                      {b.percentage_used.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between mt-1 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-[7px]">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "inline-block",
                      background: isOverBudget ? "#EF4444" : "gray",
                    }}
                  />
                  <span style={{ color: "gray", fontSize: "12px" }}>
                    Remaining
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      minWidth: "28px",
                      textAlign: "right",
                      color: "#34d399",
                    }}
                  >
                    {formatCurrency(
                      Math.max(0, totalMonthlyBudget - totalMonthlySpent),
                      "en-US",
                      "USD",
                      2,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Individual budget cards (smaller) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              budget={budget}
              cat_color={CATEGORY_COLORS[budget.category]}
              onDelete={handleDeleteBudget}
              onEdit={openEditModal}
            />
          ))}
        </div>

        {/* Create Budget Modal */}
        {showCreateModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={closeModal}
          >
            <div
              style={{
                backgroundColor: "#0a110e",
                borderRadius: "16px",
                padding: "32px",
                width: "90%",
                maxWidth: "500px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  color: "#ffffff",
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "24px",
                }}
              >
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </h2>

              {error && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <p style={{ color: "#EF4444", fontSize: "14px", margin: 0 }}>
                    {error}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disabled={!!editingBudget}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    backgroundColor: "#0a110e",
                    border: "1px solid #4a4a4a",
                    borderRadius: "8px",
                    color: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Monthly Limit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.limit}
                  onChange={(e) =>
                    setFormData({ ...formData, limit: e.target.value })
                  }
                  placeholder="500.00"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    backgroundColor: "#0a110e",
                    border: "1px solid #4a4a4a",
                    borderRadius: "8px",
                    color: "#ffffff",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: "#0a110e",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingBudget ? handleUpdateBudget : handleCreateBudget
                  }
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: "#0a110e",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {editingBudget ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsPage;
