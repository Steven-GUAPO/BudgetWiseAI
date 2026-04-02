import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import transactionService, { Transaction } from "../services/transaction.service";
import budgetService from "../services/budget.service";
import goalService from "../services/goal.service";
import { Budget } from "../types/budget.types";
import { Goal } from "../types/goal.types";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatUSD(value: number): string {
  return Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const Shimmer: React.FC<{ w?: string; h?: string }> = ({ w = "100%", h = "16px" }) => (
  <div style={{
    width: w, height: h, borderRadius: "6px",
    background: "linear-gradient(90deg, #0d1f15 25%, #122a1a 50%, #0d1f15 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  }} />
);

// Target icon for empty state
const TargetIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d4a38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

type TxTab = "all" | "revenue" | "expenses";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [txTab, setTxTab] = useState<TxTab>("all");
  const [aiHovered, setAiHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {}, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [bal, txns, bdgs, gls] = await Promise.all([
        transactionService.getBalance(),
        transactionService.getTransactions({ limit: 50 }),
        budgetService.getBudgets(),
        goalService.getGoals(undefined, false),
      ]);
      setBalance(bal);
      setTransactions(txns);
      setBudgets(bdgs);
      setGoals(gls);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const weeklyData = useMemo(() => {
    const days: Record<string, { day: string; income: number; expenses: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      days[key] = { day: key, income: 0, expenses: 0 };
    }
    transactions.forEach(t => {
      const d = new Date(t.date);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 6) {
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        if (days[key]) {
          if (t.transaction_type === "income") days[key].income += t.amount;
          else days[key].expenses += Math.abs(t.amount);
        }
      }
    });
    return Object.values(days);
  }, [transactions]);

  const totalIncome = useMemo(() =>
    transactions.filter(t => t.transaction_type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]);

  const totalExpenses = useMemo(() =>
    transactions.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]);

  const filteredTxns = useMemo(() => {
    const last5 = transactions.slice(0, 5);
    if (txTab === "revenue") return last5.filter(t => t.transaction_type === "income");
    if (txTab === "expenses") return last5.filter(t => t.transaction_type === "expense");
    return last5;
  }, [transactions, txTab]);

  // Compute progress pct directly from amounts to avoid field name mismatch
  const goalPct = (g: Goal) => {
    const current = g.current_amount ?? 0;
    const target = g.target_amount ?? 0;
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  const card = { bg: "#0c1a0f", border: "1px solid rgba(52,211,153,0.08)", radius: "14px" };

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px" }}>
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[1,2].map(i => <div key={i} style={{ background: card.bg, borderRadius: card.radius, padding: "24px", border: card.border }}><Shimmer w="60%" h="12px" /><Shimmer w="80%" h="36px" /></div>)}
        </div>
        <div style={{ background: card.bg, borderRadius: card.radius, padding: "24px", border: card.border, height: "200px" }}><Shimmer h="100%" /></div>
        <div style={{ background: card.bg, borderRadius: card.radius, padding: "24px", border: card.border, height: "240px" }}><Shimmer h="100%" /></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[1,2,3].map(i => <div key={i} style={{ background: card.bg, borderRadius: card.radius, padding: "24px", border: card.border, height: "140px" }}><Shimmer h="100%" /></div>)}
      </div>
    </div>
  );

  return (
    <div>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes aiFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes aiGlow { 0%,100%{box-shadow:0 0 12px rgba(52,211,153,0.2)} 50%{box-shadow:0 0 28px rgba(52,211,153,0.5)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(22px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(22px) rotate(-360deg)} }
        @keyframes orbitReverse { 0%{transform:rotate(0deg) translateX(14px) rotate(0deg)} 100%{transform:rotate(-360deg) translateX(14px) rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#f0fdf4", fontSize: "28px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
          Good {getTimeOfDay()}, {user?.first_name} 👋
        </h1>
        <p style={{ color: "#4b7a64", margin: "4px 0 0 0", fontSize: "14px" }}>
          Here's your financial overview
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px", alignItems: "start" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Income + Expenses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: card.bg, borderRadius: card.radius, padding: "14px 18px", border: "1px solid rgba(52,211,153,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <p style={{ color: "#4b7a64", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Income</p>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "rgba(52,211,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                </div>
              </div>
              <p style={{ color: "#34d399", fontSize: "22px", fontWeight: "800", margin: 0, letterSpacing: "-1px" }}>${formatUSD(totalIncome)}</p>
              <p style={{ color: "#4b7a64", fontSize: "12px", margin: "6px 0 0 0" }}>Total received</p>
            </div>

            <div style={{ background: card.bg, borderRadius: card.radius, padding: "14px 18px", border: "1px solid rgba(239,68,68,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <p style={{ color: "#4b7a64", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Expenses</p>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                  </svg>
                </div>
              </div>
              <p style={{ color: "#f87171", fontSize: "22px", fontWeight: "800", margin: 0, letterSpacing: "-1px" }}>${formatUSD(totalExpenses)}</p>
              <p style={{ color: "#4b7a64", fontSize: "12px", margin: "6px 0 0 0" }}>Total spent</p>
            </div>
          </div>

          {/* Analytics */}
          <div style={{ background: card.bg, borderRadius: card.radius, padding: "24px", border: card.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <p style={{ color: "#f0fdf4", fontSize: "16px", fontWeight: "700", margin: 0 }}>Analytics</p>
                <p style={{ color: "#4b7a64", fontSize: "12px", margin: "3px 0 0 0" }}>Weekly income vs expenses</p>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399" }} />
                  <span style={{ color: "#4b7a64", fontSize: "11px" }}>Income</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f87171" }} />
                  <span style={{ color: "#4b7a64", fontSize: "11px" }}>Expenses</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "#4b7a64", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4b7a64", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0d1f15", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "8px", color: "#f0fdf4" }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`]}
                />
                <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} fill="url(#incomeGrad)" dot={false} />
                <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row: Recent Transactions | Goals + Budgets stacked */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

            {/* Recent Transactions */}
            <div style={{ background: card.bg, borderRadius: card.radius, padding: "20px", border: card.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <p style={{ color: "#f0fdf4", fontSize: "14px", fontWeight: "700", margin: 0 }}>Recent Transactions</p>
                <button onClick={() => navigate("/activity")} style={{ background: "none", border: "none", color: "#34d399", fontSize: "12px", cursor: "pointer", padding: 0 }}>
                  View all →
                </button>
              </div>
              <div style={{ display: "flex", gap: "4px", backgroundColor: "#071008", borderRadius: "8px", padding: "4px", marginBottom: "14px", width: "fit-content" }}>
                {(["all", "revenue", "expenses"] as TxTab[]).map(tab => (
                  <button key={tab} onClick={() => setTxTab(tab)} style={{
                    padding: "5px 10px", borderRadius: "6px", border: "none",
                    cursor: "pointer", fontSize: "11px", fontWeight: txTab === tab ? "600" : "400",
                    backgroundColor: txTab === tab ? "rgba(52,211,153,0.12)" : "transparent",
                    color: txTab === tab ? "#34d399" : "#4b7a64",
                    transition: "all 0.15s ease", textTransform: "capitalize",
                  }}>
                    {tab}
                  </button>
                ))}
              </div>
              {filteredTxns.length === 0 ? (
                <p style={{ color: "#4b7a64", fontSize: "12px", textAlign: "center", padding: "16px 0" }}>No transactions found</p>
              ) : (
                filteredTxns.map((txn, i) => (
                  <div key={txn.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "9px 0",
                    borderBottom: i < filteredTxns.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "8px",
                        backgroundColor: txn.transaction_type === "income" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{ fontSize: "12px" }}>{txn.transaction_type === "income" ? "💰" : "🛒"}</span>
                      </div>
                      <div>
                        <p style={{ color: "#d1fae5", fontSize: "12px", fontWeight: "500", margin: 0 }}>{txn.merchant}</p>
                        <p style={{ color: "#4b7a64", fontSize: "10px", margin: "1px 0 0 0" }}>
                          {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: txn.transaction_type === "income" ? "#34d399" : "#f87171" }}>
                      {txn.transaction_type === "income" ? "+" : "-"}${Math.abs(txn.amount).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Goals + Budgets stacked */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Goals */}
              <div style={{ background: card.bg, borderRadius: card.radius, padding: "20px", border: card.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <p style={{ color: "#f0fdf4", fontSize: "14px", fontWeight: "700", margin: 0 }}>Goals</p>
                  <button onClick={() => navigate("/goals")} style={{ background: "none", border: "none", color: "#34d399", fontSize: "12px", cursor: "pointer", padding: 0 }}>
                    Manage →
                  </button>
                </div>
                {goals.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", gap: "10px" }}>
                    <TargetIcon />
                    <p style={{ color: "#2d4a38", fontSize: "12px", margin: 0, textAlign: "center", lineHeight: "1.5" }}>
                      Start saving towards<br />your goals today
                    </p>
                    <button onClick={() => navigate("/goals")} style={{
                      padding: "6px 14px", backgroundColor: "rgba(52,211,153,0.1)",
                      border: "1px solid rgba(52,211,153,0.2)", borderRadius: "6px",
                      color: "#34d399", fontSize: "11px", cursor: "pointer",
                    }}>
                      Create Goal
                    </button>
                  </div>
                ) : (
                  goals.slice(0, 3).map(g => {
                    const pct = goalPct(g);
                    const daysLeft = Math.max(0, Math.ceil((new Date(g.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                    return (
                      <div key={g.id} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ color: "#d1fae5", fontSize: "12px", fontWeight: "600" }}>{g.name}</span>
                          <span style={{ color: "#34d399", fontSize: "11px", fontWeight: "700" }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div style={{ width: "100%", height: "5px", backgroundColor: "#0d1f15", borderRadius: "3px", marginBottom: "4px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: "linear-gradient(90deg, #059669, #34d399)",
                            borderRadius: "3px",
                            boxShadow: pct > 0 ? "0 0 6px rgba(52,211,153,0.4)" : "none",
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#4b7a64", fontSize: "10px" }}>
                            ${(g.current_amount ?? 0).toFixed(0)} / ${(g.target_amount ?? 0).toFixed(0)}
                          </span>
                          <span style={{ color: "#2d4a38", fontSize: "10px" }}>{daysLeft}d left</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Budgets */}
              <div style={{ background: card.bg, borderRadius: card.radius, padding: "20px", border: card.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <p style={{ color: "#f0fdf4", fontSize: "14px", fontWeight: "700", margin: 0 }}>Budgets</p>
                  <button onClick={() => navigate("/budgets")} style={{ background: "none", border: "none", color: "#34d399", fontSize: "12px", cursor: "pointer", padding: 0 }}>
                    Manage →
                  </button>
                </div>
                {budgets.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", gap: "10px" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d4a38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <p style={{ color: "#2d4a38", fontSize: "12px", margin: 0, textAlign: "center", lineHeight: "1.5" }}>
                      Set budgets to track<br />your spending limits
                    </p>
                    <button onClick={() => navigate("/budgets")} style={{
                      padding: "6px 14px", backgroundColor: "rgba(52,211,153,0.1)",
                      border: "1px solid rgba(52,211,153,0.2)", borderRadius: "6px",
                      color: "#34d399", fontSize: "11px", cursor: "pointer",
                    }}>
                      Create Budget
                    </button>
                  </div>
                ) : (
                  budgets.slice(0, 3).map(b => {
                    const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
                    const over = b.spent > b.limit;
                    return (
                      <div key={b.id} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ color: "#d1fae5", fontSize: "12px", fontWeight: "600" }}>{b.category}</span>
                          <span style={{ color: over ? "#f87171" : "#4b7a64", fontSize: "11px" }}>
                            ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
                          </span>
                        </div>
                        <div style={{ width: "100%", height: "5px", backgroundColor: "#0d1f15", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            backgroundColor: over ? "#ef4444" : pct > 80 ? "#f59e0b" : "#34d399",
                            borderRadius: "3px", transition: "width 0.6s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Bank Cards */}
          <div style={{ background: card.bg, borderRadius: card.radius, padding: "22px 22px", border: card.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <p style={{ color: "#f0fdf4", fontSize: "14px", fontWeight: "700", margin: 0 }}>My Cards</p>
              <button onClick={() => navigate("/settings")} style={{
                padding: "4px 12px", backgroundColor: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.2)", borderRadius: "6px",
                color: "#34d399", fontSize: "11px", fontWeight: "600", cursor: "pointer",
              }}>
                Change
              </button>
            </div>

            {/* Checking */}
            <div style={{
              background: "linear-gradient(135deg, #0d2618 0%, #0a1f14 100%)",
              borderRadius: "12px", padding: "20px", marginBottom: "14px",
              border: "1px solid rgba(52,211,153,0.15)", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "rgba(52,211,153,0.05)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <p style={{ color: "#4b7a64", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>Freedom Bank</p>
                  <p style={{ color: "#d1fae5", fontSize: "14px", fontWeight: "600", margin: "4px 0 0 0" }}>Checking</p>
                </div>
                <div style={{ width: "32px", height: "24px", background: "rgba(52,211,153,0.12)", borderRadius: "4px", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <rect x="0.5" y="1.5" width="5" height="7" rx="1" stroke="#4b7a64" strokeWidth="0.7" fill="none"/>
                    <line x1="0.5" y1="5" x2="5.5" y2="5" stroke="#4b7a64" strokeWidth="0.7"/>
                    <line x1="3" y1="1.5" x2="3" y2="8.5" stroke="#4b7a64" strokeWidth="0.7"/>
                  </svg>
                </div>
              </div>
              <p style={{ color: "#4b7a64", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.12em", margin: "0 0 10px 0" }}>•••• •••• •••• 4821</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ color: "#34d399", fontSize: "20px", fontWeight: "700", margin: 0, letterSpacing: "-0.5px" }}>$4,218.50</p>
                <span style={{ color: "#4b7a64", fontSize: "11px" }}>available</span>
              </div>
            </div>

            {/* Credit */}
            <div style={{
              background: "linear-gradient(135deg, #1a0d0d 0%, #150a0a 100%)",
              borderRadius: "12px", padding: "20px",
              border: "1px solid rgba(239,68,68,0.12)", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "rgba(239,68,68,0.05)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <p style={{ color: "#4b7a64", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>Freedom Bank</p>
                  <p style={{ color: "#d1fae5", fontSize: "14px", fontWeight: "600", margin: "4px 0 0 0" }}>Credit</p>
                </div>
                <div style={{ width: "32px", height: "24px", background: "rgba(239,68,68,0.1)", borderRadius: "4px", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <rect x="0.5" y="0.5" width="13" height="9" rx="1.5" stroke="#f87171" strokeWidth="0.7" fill="none"/>
                    <rect x="0.5" y="2.5" width="13" height="2" fill="#f87171" fillOpacity="0.3"/>
                  </svg>
                </div>
              </div>
              <p style={{ color: "#4b7a64", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.12em", margin: "0 0 10px 0" }}>•••• •••• •••• 9302</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ color: "#f87171", fontSize: "20px", fontWeight: "700", margin: 0, letterSpacing: "-0.5px" }}>$1,340.00</p>
                <span style={{ color: "#4b7a64", fontSize: "11px" }}>balance owed</span>
              </div>
            </div>
          </div>

          {/* AI Agent */}
          <div
            onClick={() => navigate("/ai-assistant")}
            onMouseEnter={() => setAiHovered(true)}
            onMouseLeave={() => setAiHovered(false)}
            style={{
              background: aiHovered ? "linear-gradient(135deg, #0d2618 0%, #071008 100%)" : card.bg,
              borderRadius: card.radius,
              padding: "75px 28px",
              border: `1px solid ${aiHovered ? "rgba(52,211,153,0.25)" : "rgba(52,211,153,0.08)"}`,
              cursor: "pointer",
              transition: "all 0.25s ease",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            {/* Animated AI orb centered */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div style={{ position: "relative", width: "72px", height: "72px" }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #059669, #34d399)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "30px",
                  animation: "aiFloat 2.5s ease-in-out infinite",
                  boxShadow: "0 0 28px rgba(52,211,153,0.5)",
                }}>
                  🤖
                </div>
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: "7px", height: "7px", marginTop: "-3.5px", marginLeft: "-3.5px",
                  backgroundColor: "#34d399", borderRadius: "50%",
                  animation: "orbit 2s linear infinite",
                  boxShadow: "0 0 5px #34d399",
                }} />
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: "5px", height: "5px", marginTop: "-2.5px", marginLeft: "-2.5px",
                  backgroundColor: "#6ee7b7", borderRadius: "50%",
                  animation: "orbitReverse 1.4s linear infinite",
                }} />
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#f0fdf4", fontSize: "16px", fontWeight: "700", margin: "0 0 8px 0"   }}>
                  AI Assistant
                </p>
                <p style={{ color: "#4b7a64", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
                  Ask about your finances, create goals, analyze spending patterns and more
                </p>
              </div>
            </div>

            <div style={{
              padding: "12px 16px",
              backgroundColor: "rgba(52,211,153,0.08)",
              borderRadius: "10px", border: "1px solid rgba(52,211,153,0.15)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#34d399", fontSize: "13px", fontWeight: "600" }}>
                Chat with BudgetWise AI
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
