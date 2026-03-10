import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import transactionService, { Transaction } from '../services/transaction.service';
import budgetService from '../services/budget.service';
import goalService from '../services/goal.service';
import { Budget } from '../types/budget.types';
import { Goal } from '../types/goal.types';
import api from '../services/api';

const CATEGORY_COLORS: Record<string, string> = {
  Shopping: '#6366f1',
  Food: '#f59e0b',
  Utilities: '#3b82f6',
  Entertainment: '#8b5cf6',
  Transportation: '#10b981',
  Healthcare: '#ef4444',
  Education: '#06b6d4',
  Income: '#22c55e',
  Other: '#6b7280',
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    // Auto Sync in background
    api.post('/bank/sync').catch(() => {});
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
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
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate top 3 spending categories from all transactions
  const getTopCategories = () => {
    const allTxns = transactions.filter(t => t.transaction_type === 'expense');
    const categoryTotals: Record<string, number> = {};
    allTxns.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const topCategories = getTopCategories();
  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalMonthlySpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#4b7a64', fontSize: '15px' }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
          Good {getTimeOfDay()}, {user?.first_name} 👋
        </h1>
        <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
          Here's your financial overview
        </p>
      </div>

      {/* Top row — Balance + Monthly Budget */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Balance */}
        <div style={cardStyle}>
          <p style={labelStyle}>Total Balance</p>
          <p style={{
            color: balance >= 0 ? '#34d399' : '#f87171',
            fontSize: '36px', fontWeight: '800',
            margin: '8px 0 0 0', letterSpacing: '-1px',
          }}>
            {balance < 0 ? '-' : ''}${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p style={{ color: '#4b7a64', fontSize: '12px', margin: '6px 0 0 0' }}>
            Across all accounts
          </p>
        </div>

        {/* Monthly budget overview */}
        <div style={cardStyle}>
          <p style={labelStyle}>Monthly Budget</p>
          <p style={{
            color: '#f0fdf4', fontSize: '28px', fontWeight: '700',
            margin: '8px 0 4px 0', letterSpacing: '-0.5px',
          }}>
            ${totalMonthlySpent.toFixed(2)}
            <span style={{ color: '#4b7a64', fontSize: '16px', fontWeight: '400' }}>
              {' '}/ ${totalMonthlyBudget.toFixed(2)}
            </span>
          </p>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#0d1f15', borderRadius: '3px', marginTop: '8px' }}>
            <div style={{
              height: '100%',
              width: `${Math.min((totalMonthlySpent / totalMonthlyBudget) * 100 || 0, 100)}%`,
              backgroundColor: totalMonthlySpent > totalMonthlyBudget ? '#ef4444' : '#34d399',
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <p style={{ color: '#4b7a64', fontSize: '12px', margin: '6px 0 0 0' }}>
            {budgets.length} active budgets · {budgets.filter(b => b.is_over_budget).length} over limit
          </p>
        </div>
      </div>

      {/* Second row — Top Categories + Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Top spending categories */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <p style={labelStyle}>Top Spending</p>
            <button onClick={() => navigate('/activity')} style={linkButtonStyle}>View all →</button>
          </div>
          {topCategories.length === 0 ? (
            <p style={{ color: '#4b7a64', fontSize: '13px', marginTop: '16px' }}>No expense data yet</p>
          ) : (
            topCategories.map(([cat, amount]) => {
              const maxAmount = topCategories[0][1];
              return (
                <div key={cat} style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: CATEGORY_COLORS[cat] || '#6b7280',
                        flexShrink: 0,
                      }} />
                      <span style={{ color: '#d1fae5', fontSize: '13px' }}>{cat}</span>
                    </div>
                    <span style={{ color: '#f0fdf4', fontSize: '13px', fontWeight: '600' }}>
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#0d1f15', borderRadius: '2px' }}>
                    <div style={{
                      height: '100%',
                      width: `${(amount / maxAmount) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[cat] || '#6b7280',
                      borderRadius: '2px',
                    }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent transactions */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <p style={labelStyle}>Recent Transactions</p>
            <button onClick={() => navigate('/activity')} style={linkButtonStyle}>View all →</button>
          </div>
          {transactions.length === 0 ? (
            <p style={{ color: '#4b7a64', fontSize: '13px', marginTop: '16px' }}>No transactions yet</p>
          ) : (
            transactions.slice(0, 5).map(txn => (
              <div key={txn.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div>
                  <p style={{ color: '#d1fae5', fontSize: '13px', fontWeight: '500', margin: 0 }}>
                    {txn.merchant}
                  </p>
                  <p style={{ color: '#4b7a64', fontSize: '11px', margin: '2px 0 0 0' }}>
                    {txn.category} · {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: '600',
                  color: txn.transaction_type === 'income' ? '#34d399' : '#f87171',
                }}>
                  {txn.transaction_type === 'income' ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Third row — Budgets + Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Budget progress */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <p style={labelStyle}>Budget Progress</p>
            <button onClick={() => navigate('/budgets')} style={linkButtonStyle}>Manage →</button>
          </div>
          {budgets.length === 0 ? (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#4b7a64', fontSize: '13px', marginBottom: '12px' }}>No budgets created yet</p>
              <button onClick={() => navigate('/budgets')} style={actionButtonStyle}>
                Create Budget
              </button>
            </div>
          ) : (
            budgets.slice(0, 4).map(b => (
              <div key={b.id} style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#d1fae5', fontSize: '12px' }}>{b.category}</span>
                  <span style={{
                    color: b.is_over_budget ? '#f87171' : '#4b7a64',
                    fontSize: '12px',
                  }}>
                    ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#0d1f15', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(b.percentage_used, 100)}%`,
                    backgroundColor: b.is_over_budget ? '#ef4444' : b.percentage_used > 80 ? '#f59e0b' : '#34d399',
                    borderRadius: '3px',
                  }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Goals */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <p style={labelStyle}>Savings Goals</p>
            <button onClick={() => navigate('/goals')} style={linkButtonStyle}>Manage →</button>
          </div>
          {goals.length === 0 ? (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#4b7a64', fontSize: '13px', marginBottom: '12px' }}>No goals created yet</p>
              <button onClick={() => navigate('/goals')} style={actionButtonStyle}>
                Create Goal
              </button>
            </div>
          ) : (
            goals.slice(0, 3).map(g => (
              <div key={g.id} style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#d1fae5', fontSize: '12px', fontWeight: '500' }}>{g.name}</span>
                  <span style={{ color: '#4b7a64', fontSize: '12px' }}>
                    {g.percentage_completed.toFixed(0)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#0d1f15', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(g.percentage_completed, 100)}%`,
                    backgroundColor: '#34d399',
                    borderRadius: '3px',
                  }} />
                </div>
                <p style={{ color: '#4b7a64', fontSize: '11px', margin: '4px 0 0 0' }}>
                  ${g.current_amount.toFixed(0)} of ${g.target_amount.toFixed(0)} · {g.days_remaining}d left
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Shared styles
const cardStyle: React.CSSProperties = {
  backgroundColor: '#0c1a0f',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid rgba(52, 211, 153, 0.08)',
};

const labelStyle: React.CSSProperties = {
  color: '#4b7a64',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  margin: 0,
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#34d399',
  fontSize: '12px',
  cursor: 'pointer',
  padding: 0,
};

const actionButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: 'rgba(52, 211, 153, 0.1)',
  border: '1px solid rgba(52, 211, 153, 0.2)',
  borderRadius: '6px',
  color: '#34d399',
  fontSize: '13px',
  cursor: 'pointer',
  fontWeight: '500',
};

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default Dashboard;