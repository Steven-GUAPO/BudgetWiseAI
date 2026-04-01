import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import transactionService, {
  Transaction,
} from "../services/transaction.service";
import budgetService from "../services/budget.service";
import goalService from "../services/goal.service";
import { Budget } from "../types/budget.types";
import { Goal } from "../types/goal.types";
import api from "../services/api";
import { useNotifications } from "../context/NotificationContext";

// Constants

const CATEGORY_COLORS: Record<string, string> = {
  Shopping: "#6366f1",
  Food: "#f59e0b",
  Utilities: "#3b82f6",
  Entertainment: "#8b5cf6",
  Transportation: "#10b981",
  Healthcare: "#ef4444",
  Education: "#06b6d4",
  Income: "#22c55e",
  Other: "#6b7280",
};

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatUSD(value: number, decimals = 2): string {
  return Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Reusable UI Components

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-[#0c1a0f] rounded-xl p-5 border border-emerald-400/[0.08] ${className}`}
  >
    {children}
  </div>
);

const SectionHeader: React.FC<{
  label: string;
  linkLabel?: string;
  onLink?: () => void;
}> = ({ label, linkLabel, onLink }) => (
  <div className="flex justify-between items-center mb-1 w-full">
    <p className="text-[#4b7a64] text-sm font-semibold uppercase tracking-widest m-0">
      {label}
    </p>
    {linkLabel && onLink && (
      <button
        onClick={onLink}
        className="bg-transparent border-0 text-emerald-400 text-xs cursor-pointer p-0 hover:text-emerald-300 transition-colors"
      >
        {linkLabel}
      </button>
    )}
  </div>
);

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

const EmptyState: React.FC<{
  message: string;
  cta: string;
  onClick: () => void;
}> = ({ message, cta, onClick }) => (
  <div className="mt-4">
    <p className="text-[#4b7a64] text-sm mb-3">{message}</p>
    <button
      onClick={onClick}
      className="px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-md text-emerald-400 text-xs font-medium cursor-pointer hover:bg-emerald-400/20 transition-colors"
    >
      {cta}
    </button>
  </div>
);

// Skeleton Loader

const Shimmer: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-emerald-900/20 rounded animate-pulse ${className}`} />
);

const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <Card>
    <Shimmer className="h-3 w-24 mb-4" />
    <Shimmer className="h-7 w-32 mb-4" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="mt-3.5">
        <div className="flex justify-between mb-1.5">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-12" />
        </div>
        <Shimmer className="h-1.5 w-full" />
      </div>
    ))}
  </Card>
);

const DashboardSkeleton: React.FC = () => (
  <div>
    <div className="mb-8">
      <Shimmer className="h-7 w-56 mb-2" />
      <Shimmer className="h-4 w-40" />
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <SkeletonCard rows={1} />
      <SkeletonCard rows={1} />
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <SkeletonCard rows={3} />
      <SkeletonCard rows={4} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <SkeletonCard rows={3} />
      <SkeletonCard rows={3} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const [bal, txns, bdgs, gls] = await Promise.all([
        transactionService.getBalance(),
        transactionService.getTransactions({ limit: 5 }),
        budgetService.getBudgets(),
        goalService.getGoals(undefined, false),
      ]);
      setBalance(bal);
      setTransactions(txns);
      setBudgets(bdgs);
      setGoals(gls);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derived values — memoised so they don't recompute on every render
  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions
      .filter((t) => t.transaction_type === "expense")
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
      });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [transactions]);

  const {
    totalMonthlyBudget,
    totalMonthlySpent,
    budgetPct,
    isOverBudget,
    overBudgetCount,
  } = useMemo(() => {
    const spent = budgets.reduce((s, b) => s + b.spent, 0);
    const limit = budgets.reduce((s, b) => s + b.limit, 0);
    return {
      totalMonthlyBudget: limit,
      totalMonthlySpent: spent,
      budgetPct: limit ? Math.min((spent / limit) * 100, 100) : 0,
      isOverBudget: spent > limit,
      overBudgetCount: budgets.filter((b) => b.is_over_budget).length,
    };
  }, [budgets]);

  const netIncome = useMemo(
    () =>
      transactions.reduce(
        (sum, t) =>
          t.transaction_type === "income"
            ? sum + t.amount
            : sum - Math.abs(t.amount),
        0,
      ),
    [transactions],
  );

  // Render states

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => fetchAll()}
          className="px-5 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-lg text-emerald-400 text-sm font-medium hover:bg-emerald-400/20 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "14px" }}>
        <h1
          style={{
            color: "#f0fdf4",
            fontSize: "26px",
            fontWeight: "700",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Good {getTimeOfDay()}, {user?.first_name} 👋
        </h1>
        <p style={{ color: "#4b7a64", margin: "4px 0 0 0", fontSize: "14px" }}>
          Here's your financial overview
        </p>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          title="Refresh"
          className="mt-1 p-2 rounded-lg text-[#4b7a64] hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors cursor-pointer border-0 bg-transparent disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={refreshing ? "animate-spin" : ""}
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>

      {/* Top row — Balance + Monthly Budget */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <Card>
          <SectionHeader label="Total Balance" />
          <p
            style={{
              color: balance >= 0 ? "#34d399" : "#f87171",
              fontSize: "36px",
              fontWeight: "800",
              margin: "8px 0 0 0",
              letterSpacing: "-1px",
            }}
          >
            {balance < 0 ? "-" : ""}${formatUSD(balance)}
          </p>
          <p
            style={{ color: "#4b7a64", fontSize: "12px", margin: "6px 0 0 0" }}
          >
            Across all accounts:
            <span
              className={netIncome < 0 ? "text-red-400" : "text-emerald-400"}
              style={{ fontWeight: "600", marginLeft: "4px" }}
            >
              ${formatUSD(netIncome)}
            </span>
          </p>
        </Card>

        <Card>
          <SectionHeader
            label="My Cards"
            linkLabel="Manage →"
            onLink={() => navigate("/accounts")}
          />

          {/* Checking */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "22px",
                  background: "rgba(52,211,153,0.07)",
                  borderRadius: "4px",
                  border: "1px solid rgba(52,211,153,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* chip icon */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <rect
                    x="1"
                    y="2.5"
                    width="6"
                    height="7"
                    rx="1"
                    stroke="#4b7a64"
                    strokeWidth="0.7"
                    fill="none"
                  />
                  <line
                    x1="1"
                    y1="6"
                    x2="7"
                    y2="6"
                    stroke="#4b7a64"
                    strokeWidth="0.7"
                  />
                  <line
                    x1="4"
                    y1="2.5"
                    x2="4"
                    y2="9.5"
                    stroke="#4b7a64"
                    strokeWidth="0.7"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    color: "#d1fae5",
                    fontSize: "13px",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  Freedom Bank
                </p>
                <p
                  style={{
                    color: "#4b7a64",
                    fontSize: "11px",
                    margin: "3px 0 0 0",
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  Checking •••• 4821
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  color: "#34d399",
                  fontSize: "15px",
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                ${formatUSD(4218.5)}
              </p>
              <p
                style={{
                  color: "#4b7a64",
                  fontSize: "10px",
                  margin: "2px 0 0 0",
                }}
              >
                available
              </p>
            </div>
          </div>

          {/* Credit */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "22px",
                  background: "rgba(52,211,153,0.07)",
                  borderRadius: "4px",
                  border: "1px solid rgba(52,211,153,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* card icon */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="14"
                    height="10"
                    rx="1.5"
                    stroke="#4b7a64"
                    strokeWidth="0.7"
                    fill="none"
                  />
                  <rect
                    x="1"
                    y="3.5"
                    width="14"
                    height="2"
                    fill="#4b7a64"
                    fillOpacity="0.4"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    color: "#d1fae5",
                    fontSize: "13px",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  Freedom Bank
                </p>
                <p
                  style={{
                    color: "#4b7a64",
                    fontSize: "11px",
                    margin: "3px 0 0 0",
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  Credit •••• 9302
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  color: "#f87171",
                  fontSize: "15px",
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                ${formatUSD(1340.0)}
              </p>
              <p
                style={{
                  color: "#4b7a64",
                  fontSize: "10px",
                  margin: "2px 0 0 0",
                }}
              >
                balance owed
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Second row — Top Categories + Recent Transactions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <SectionHeader
            label="Monthly Budget"
            linkLabel="View All →"
            onLink={() => navigate("/budgets")}
          />
          <p
            style={{
              color: "#f0fdf4",
              fontSize: "28px",
              fontWeight: "700",
              margin: "8px 0 4px 0",
              letterSpacing: "-0.5px",
            }}
          >
            ${totalMonthlySpent.toFixed(2)}
            <span
              style={{ color: "#4b7a64", fontSize: "16px", fontWeight: "400" }}
            >
              {" "}
              / ${totalMonthlyBudget.toFixed(2)}
            </span>
          </p>
          <div className="mt-2">
            <ProgressBar
              pct={budgetPct}
              colorClass={isOverBudget ? "bg-red-500" : "bg-emerald-400"}
            />
          </div>
          <p
            style={{ color: "#4b7a64", fontSize: "12px", margin: "6px 0 0 0" }}
          >
            {budgets.length} active budgets · {overBudgetCount} over limit
          </p>
          {budgets.length === 0 ? (
            <EmptyState
              message="No budgets created yet"
              cta="Create Budget"
              onClick={() => navigate("/budgets")}
            />
          ) : (
            budgets.slice(0, 4).map((b) => {
              const barColor = b.is_over_budget
                ? "bg-red-500"
                : b.percentage_used > 80
                  ? "bg-amber-400"
                  : "bg-emerald-400";
              return (
                <div key={b.id} className="mt-3.5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[#d1fae5] text-xs">{b.category}</span>
                    <span
                      className={`text-xs ${
                        b.is_over_budget ? "text-red-400" : "text-[#4b7a64]"
                      }`}
                    >
                      ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
                    </span>
                  </div>
                  <ProgressBar pct={b.percentage_used} colorClass={barColor} />
                </div>
              );
            })
          )}
        </Card>

        <Card>
          <SectionHeader
            label="Recent Transactions"
            linkLabel="View all →"
            onLink={() => navigate("/activity")}
          />
          {transactions.length === 0 ? (
            <p
              style={{ color: "#4b7a64", fontSize: "13px", marginTop: "16px" }}
            >
              No transactions yet
            </p>
          ) : (
            transactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#d1fae5",
                      fontSize: "13px",
                      fontWeight: "500",
                      margin: 0,
                    }}
                  >
                    {txn.merchant}
                  </p>
                  <p
                    style={{
                      color: "#4b7a64",
                      fontSize: "11px",
                      margin: "2px 0 0 0",
                    }}
                  >
                    {txn.category} ·{" "}
                    {new Date(txn.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color:
                      txn.transaction_type === "income" ? "#34d399" : "#f87171",
                  }}
                >
                  {txn.transaction_type === "income" ? "+" : "-"}$
                  {Math.abs(txn.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Third row — Budgets + Goals */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader
            label="Top Categories"
            linkLabel="View all →"
            onLink={() => navigate("/activity")}
          />
          {topCategories.length === 0 ? (
            <p
              style={{ color: "#4b7a64", fontSize: "13px", marginTop: "16px" }}
            >
              No expense data yet
            </p>
          ) : (
            topCategories.map(([cat, amount]) => {
              const maxAmount = topCategories[0][1];
              return (
                <div key={cat} style={{ marginTop: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: CATEGORY_COLORS[cat] || "#6b7280",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "#d1fae5", fontSize: "13px" }}>
                        {cat}
                      </span>
                    </div>
                    <span
                      style={{
                        color: "#f0fdf4",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "4px",
                      backgroundColor: "#0d1f15",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(amount / maxAmount) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[cat] || "#6b7280",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </Card>

        <Card>
          <SectionHeader
            label="Savings Goals"
            linkLabel="Manage →"
            onLink={() => navigate("/goals")}
          />
          {goals.length === 0 ? (
            <EmptyState
              message="No goals created yet"
              cta="Create Goal"
              onClick={() => navigate("/goals")}
            />
          ) : (
            goals.slice(0, 3).map((g) => {
              const pct = g.percentage_complete ?? 0;
              const daysLeft = Math.max(
                0,
                Math.ceil(
                  (new Date(g.target_date).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                ),
              );
              return (
                <div key={g.id} className="mt-3.5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[#d1fae5] text-xs font-medium">
                      {g.name}
                    </span>
                    <span className="text-[#4b7a64] text-xs">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar pct={pct} colorClass="bg-emerald-400" />
                  <p className="text-[#4b7a64] text-[11px] mt-1 m-0">
                    ${(g.current_amount ?? 0).toFixed(0)} of $
                    {(g.target_amount ?? 0).toFixed(0)} · {daysLeft}d left
                  </p>
                </div>
              );
            })
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <SectionHeader
          label="AI Assistant"
          linkLabel="Chat →"
          onLink={() => navigate("/ai-assistant")}
        />
        <p style={{ color: "#4b7a64", fontSize: "13px", marginTop: "8px" }}>
          Ask questions or get insights about your finances
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;
