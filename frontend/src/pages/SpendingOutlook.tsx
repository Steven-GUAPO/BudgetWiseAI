import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, CartesianGrid,
} from 'recharts';

interface Transaction {
  category: string;
  amount: number;
  transaction_type: string;
  date: string;
  merchant: string;
}

interface Budget {
  category: string;
  spent: number;
  limit: number;
  is_over_budget: boolean;
  percentage_used: number;
}

const COLORS = ['#34d399', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#10b981'];

const parseSection = (text: string, heading: string): string[] => {
  const regex = new RegExp(`${heading}:\\s*([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, 'i');
  const match = text.match(regex);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(l => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(l => l.length > 0 && l !== 'None');
};

const SectionBlock: React.FC<{
  label: string;
  items: string[];
  accentColor: string;
  textColor: string;
  fallback?: string;
}> = ({ label, items, accentColor, textColor, fallback }) => {
  if (items.length === 0 && !fallback) return null;
  return (
      <div style={{ borderLeft: `2px solid ${accentColor}`, paddingLeft: '14px', borderRadius: 0 }}>
      <p style={{
        margin: '0 0 6px', fontSize: '11px', fontWeight: '700',
        color: textColor, textTransform: 'uppercase', letterSpacing: '0.6px',
      }}>{label}</p>
      {items.length > 0 ? (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: accentColor, flexShrink: 0, marginTop: '1px', fontSize: '12px' }}>•</span>
              <span style={{ color: '#d1fae5', fontSize: '13px', lineHeight: '1.6' }}>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, fontSize: '13px', color: '#4b7a64', lineHeight: '1.6' }}>{fallback}</p>
      )}
    </div>
  );
};
 
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '32px 16px', gap: '8px',
  }}>
    <div style={{ fontSize: '24px', opacity: 0.4 }}>📭</div>
    <p style={{ margin: 0, fontSize: '13px', color: '#4b7a64', textAlign: 'center' }}>{message}</p>
  </div>
);

const LoadingPulse: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} style={{
        height: '12px', borderRadius: '6px',
        background: 'rgba(52,211,153,0.08)',
        width: i === lines - 1 ? '60%' : '100%',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: `${i * 0.15}s`,
      }} />
    ))}
  </div>
);

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0c1a0f',
  borderRadius: '14px',
  padding: '22px',
  border: '1px solid rgba(52,211,153,0.09)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#071008', border: '1px solid rgba(52,211,153,0.25)',
        borderRadius: '8px', padding: '10px 14px',
      }}>
        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#4b7a64' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#34d399' }}>
          ${Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const SpendingOutlook: React.FC = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [outlook, setOutlook] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingOutlook, setLoadingOutlook] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchData();
    fetchBoth();
  }, []);

  const fetchData = async () => {
    try {
      const [txnRes, budgetRes] = await Promise.all([
        api.get('/transactions/', { params: { limit: 200 } }),
        api.get('/budgets/'),
      ]);
      setTransactions(txnRes.data);
      setBudgets(budgetRes.data);
      setLastUpdated(new Date());
    } catch {
      // silently fail
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBoth = async () => {
    setLoadingAnalysis(true);
    setLoadingOutlook(true);

    api.get('/ai/spending-analysis')
      .then(res => setAnalysis(res.data.analysis))
      .catch(() => setAnalysis('Unable to load analysis.'))
      .finally(() => setLoadingAnalysis(false));

    api.get('/ai/spending-outlook')
      .then(res => setOutlook(res.data.outlook))
      .catch(() => setOutlook('Unable to load outlook.'))
      .finally(() => setLoadingOutlook(false));
  };

  const handleRefresh = () => { fetchData(); fetchBoth(); };

  // Build category spending chart data
  const categoryData = React.useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.filter(t => t.transaction_type === 'expense').forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, amount]) => ({
        category: category.length > 10 ? category.slice(0, 10) + '…' : category,
        amount: parseFloat(amount.toFixed(2)),
      }));
  }, [transactions]);

  // Build monthly trend data
  const monthlyData = React.useMemo(() => {
    const months: Record<string, number> = {};
    transactions.filter(t => t.transaction_type === 'expense').forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months[month] = (months[month] || 0) + t.amount;
    });
    return Object.entries(months)
      .slice(-6)
      .map(([month, total]) => ({ month, total: parseFloat(total.toFixed(2)) }));
  }, [transactions]);


  const totalSpent = transactions.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + t.amount, 0);
  const expenseCount = transactions.filter(t => t.transaction_type === 'expense').length;
  const overBudgetCount = budgets.filter(b => b.is_over_budget).length;
  const budgetHealthPct = budgets.length > 0
  ? Math.round(((budgets.length - overBudgetCount) / budgets.length) * 100)
  : null;

  const analysisInsights = analysis ? parseSection(analysis, 'INSIGHTS') : [];
  const analysisWarnings = analysis ? parseSection(analysis, 'WARNINGS') : [];
  const analysisRecs = analysis ? parseSection(analysis, 'RECOMMENDATIONS') : [];
  const outlookForecast = outlook ? parseSection(outlook, 'FORECAST') : [];
  const outlookGoals = outlook ? parseSection(outlook, 'GOAL PROGRESS') : [];
  const outlookSteps = outlook ? parseSection(outlook, 'NEXT STEPS') : [];

  const timeAgo = lastUpdated
    ? `Updated ${Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago`
    : 'Loading...';
 
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .outlook-card { animation: fadeIn 0.3s ease; }
        .refresh-btn:hover { background: linear-gradient(135deg,#047857,#10b981) !important; transform: translateY(-1px); }
        .refresh-btn:active { transform: translateY(0) !important; }
      `}</style>
 
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
 
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h1 style={{ color: '#f0fdf4', fontSize: '22px', fontWeight: '700', margin: 0, letterSpacing: '-0.4px' }}>
              Spending Outlook
            </h1>
            <p style={{ color: '#4b7a64', margin: '5px 0 0', fontSize: '13px' }}>
              AI-powered spending forecasts and trends · {timeAgo}
            </p>
          </div>
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            style={{
              padding: '9px 20px',
              background: 'linear-gradient(135deg,#059669,#34d399)',
              color: '#fff', border: 'none', borderRadius: '9px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              transition: 'all 0.2s',
            }}
          >↻ Refresh</button>
        </div>
 
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            {
              label: 'Total spent',
              value: `$${totalSpent.toFixed(2)}`,
              color: totalSpent > 0 ? '#f87171' : '#4b7a64',
            },
            {
              label: 'Transactions',
              value: expenseCount,
              color: '#f0fdf4',
            },
            {
              label: 'Active budgets',
              value: budgets.length,
              color: '#34d399',
            },
          ].map(stat => (
            <div key={stat.label} className="outlook-card" style={{ ...cardStyle, padding: '18px 20px' }}>
              <p style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>
                {stat.label}
              </p>
              <p style={{ color: stat.color, fontSize: '22px', fontWeight: '700', margin: 0 }}>
                {stat.value}
              </p>
            </div>
          ))}
 
          {/* Budget health card */}
          <div className="outlook-card" style={{ ...cardStyle, padding: '18px 20px' }}>
            <p style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>
              Budget health
            </p>
            {budgetHealthPct === null ? (
              <p style={{ color: '#4b7a64', fontSize: '14px', fontWeight: '700', margin: 0 }}>No budgets</p>
            ) : (
              <>
                <p style={{
                  color: budgetHealthPct >= 80 ? '#34d399' : budgetHealthPct >= 50 ? '#f59e0b' : '#f87171',
                  fontSize: '22px', fontWeight: '700', margin: '0 0 10px',
                }}>{budgetHealthPct}%</p>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%',
                    width: `${budgetHealthPct}%`,
                    background: budgetHealthPct >= 80 ? '#34d399' : budgetHealthPct >= 50 ? '#f59e0b' : '#ef4444',
                    borderRadius: '3px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </>
            )}
          </div>
        </div>
 
        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '16px', marginBottom: '20px' }}>
 
          {/* Category bar chart */}
          <div className="outlook-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📊</span>
                <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>Spending by category</h2>
              </div>
              <span style={{
                fontSize: '11px', color: '#4b7a64',
                background: 'rgba(52,211,153,0.08)', padding: '3px 10px',
                borderRadius: '20px', border: '1px solid rgba(52,211,153,0.12)',
              }}>{categoryData.length} {categoryData.length === 1 ? 'category' : 'categories'}</span>
            </div>
            {loadingData ? <LoadingPulse lines={4} /> : categoryData.length === 0 ? (
              <EmptyState message="Add transactions to see category spending" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="category" tick={{ fill: '#4b7a64', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4b7a64', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
 
          {/* Monthly trend */}
          <div className="outlook-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📈</span>
                <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>Monthly trend</h2>
              </div>
              <span style={{
                fontSize: '11px', color: '#4b7a64',
                background: 'rgba(52,211,153,0.08)', padding: '3px 10px',
                borderRadius: '20px', border: '1px solid rgba(52,211,153,0.12)',
              }}>{monthlyData.length} {monthlyData.length === 1 ? 'month' : 'months'}</span>
            </div>
            {loadingData ? <LoadingPulse lines={4} /> : monthlyData.length === 0 ? (
              <EmptyState message="Add transactions to see your spending trend" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" tick={{ fill: '#4b7a64', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4b7a64', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="total" stroke="#34d399" strokeWidth={2.5}
                    dot={{ fill: '#34d399', r: 4, strokeWidth: 2, stroke: '#071008' }}
                    activeDot={{ r: 6, fill: '#34d399' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
 
        {/* Budget usage */}
        {budgets.length > 0 && (
          <div className="outlook-card" style={{ ...cardStyle, marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px' }}>💰</span>
              <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>Budget usage</h2>
              {overBudgetCount > 0 && (
                <span style={{
                  fontSize: '11px', color: '#f87171', background: 'rgba(248,113,113,0.1)',
                  padding: '2px 10px', borderRadius: '20px', border: '1px solid rgba(248,113,113,0.2)',
                }}>
                  {overBudgetCount} over budget
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '16px' }}>
              {budgets.map(b => {
                const color = b.is_over_budget ? '#ef4444' : b.percentage_used > 80 ? '#f59e0b' : '#34d399';
                return (
                  <div key={b.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#d1fae5', fontSize: '13px' }}>{b.category}</span>
                      <span style={{ color: b.is_over_budget ? '#f87171' : '#4b7a64', fontSize: '12px' }}>
                        ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
                        {b.is_over_budget && <span style={{ marginLeft: '4px' }}>⚠</span>}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(b.percentage_used, 100)}%`,
                        backgroundColor: color,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#4b7a64', textAlign: 'right' }}>
                      {b.percentage_used.toFixed(0)}% used
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
 
        {/* AI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '16px' }}>
 
          {/* AI Analysis */}
          <div className="outlook-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#065f46,#10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
              }}>🤖</div>
              <div>
                <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>AI spending analysis</h2>
                <p style={{ margin: 0, fontSize: '11px', color: '#4b7a64' }}>Powered by BudgetWise AI</p>
              </div>
            </div>
            {loadingAnalysis ? (
              <LoadingPulse lines={5} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SectionBlock
                  label="Key insights" items={analysisInsights}
                  accentColor="#34d399" textColor="#34d399"
                  fallback="No insights available yet. Start adding expenses to see personalized insights."
                />
                {analysisWarnings.length > 0 && (
                  <SectionBlock label="⚠ Warnings" items={analysisWarnings} accentColor="#f59e0b" textColor="#f59e0b" />
                )}
                {analysisRecs.length > 0 && (
                  <SectionBlock label="Recommendations" items={analysisRecs} accentColor="#3b82f6" textColor="#60a5fa" />
                )}
                {analysisInsights.length === 0 && analysisWarnings.length === 0 && analysisRecs.length === 0 && analysis && (
                  <p style={{ color: '#d1fae5', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{analysis}</p>
                )}
              </div>
            )}
          </div>
 
          {/* AI Forecast */}
          <div className="outlook-card" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
              }}>🔮</div>
              <div>
                <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>AI forecast</h2>
                <p style={{ margin: 0, fontSize: '11px', color: '#4b7a64' }}>End-of-month projection</p>
              </div>
            </div>
            {loadingOutlook ? (
              <LoadingPulse lines={5} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SectionBlock
                  label="Forecast" items={outlookForecast}
                  accentColor="#3b82f6" textColor="#60a5fa"
                  fallback="No forecast data yet. Add transactions to generate predictions."
                />
                {outlookGoals.length > 0 && (
                  <SectionBlock label="Goal progress" items={outlookGoals} accentColor="#f59e0b" textColor="#f59e0b" />
                )}
                {outlookSteps.length > 0 && (
                  <SectionBlock label="Next steps" items={outlookSteps} accentColor="#34d399" textColor="#34d399" />
                )}
                {outlookForecast.length === 0 && outlookGoals.length === 0 && outlookSteps.length === 0 && outlook && (
                  <p style={{ color: '#d1fae5', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{outlook}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
 
export default SpendingOutlook;
