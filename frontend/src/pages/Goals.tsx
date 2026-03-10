import React, { useState, useEffect } from 'react';
import goalService from '../services/goal.service';
import { Goal, GoalCreate } from '../types/goal.types';

const PRIORITY_COLORS = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444' };
const PRIORITY_BG = { low: 'rgba(59,130,246,0.1)', medium: 'rgba(245,158,11,0.1)', high: 'rgba(239,68,68,0.1)' };

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCompleted, setFilterCompleted] = useState<'All' | 'Active' | 'Completed'>('Active');

  const [form, setForm] = useState<GoalCreate>({
    name: '',
    description: '',
    target_amount: 0,
    target_date: '',
    priority: 'medium',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [gls, sum] = await Promise.all([
        goalService.getGoals(),
        goalService.getGoalSummary(),
      ]);
      setGoals(gls);
      setSummary(sum);
    } catch {
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Goal name is required'); return; }
    if (!form.target_amount || form.target_amount <= 0) { setError('Enter a valid target amount'); return; }
    if (!form.target_date) { setError('Target date is required'); return; }
    try {
      setSubmitting(true);
      setError('');
      await goalService.createGoal({
        ...form,
        target_date: new Date(form.target_date + 'T12:00:00').toISOString(),
      });
      await fetchAll();
      resetForm();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { setError('Enter a valid deposit amount'); return; }
    try {
      setSubmitting(true);
      setError('');
      await goalService.makeDeposit(depositGoalId!, { amount });
      await fetchAll();
      setDepositGoalId(null);
      setDepositAmount('');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to make deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalService.deleteGoal(id);
      await fetchAll();
    } catch {
      setError('Failed to delete goal');
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', target_amount: 0, target_date: '', priority: 'medium' });
    setShowForm(false);
  };

  const filteredGoals = goals.filter(g => {
    if (filterPriority !== 'All' && g.priority !== filterPriority.toLowerCase()) return false;
    if (filterCompleted === 'Active' && g.is_completed) return false;
    if (filterCompleted === 'Completed' && !g.is_completed) return false;
    return true;
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#4b7a64', fontSize: '15px' }}>Loading goals...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
            Savings Goals
          </h1>
          <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
            {summary?.active_goals ?? goals.filter(g => !g.is_completed).length} active · {summary?.completed_goals ?? goals.filter(g => g.is_completed).length} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            color: '#fff', border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px', fontWeight: '600',
          }}
        >
          + New Goal
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Target',    value: `$${(summary.total_target ?? 0).toFixed(2)}`,    color: '#f0fdf4' },
          { label: 'Total Saved',     value: `$${(summary.total_saved ?? 0).toFixed(2)}`,     color: '#34d399' },
          { label: 'Still Needed',    value: `$${(summary.total_remaining ?? 0).toFixed(2)}`, color: '#f87171' },
          { label: 'Overall Progress',value: `${(summary.percentage_complete ?? 0).toFixed(1)}%`, color: '#34d399' },
      ].map(card => (
        <div key={card.label} style={{
          backgroundColor: '#0c1a0f', borderRadius: '10px', padding: '16px',
          border: '1px solid rgba(52,211,153,0.08)',
        }}>
          <p style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px 0' }}>
           {card.label}
          </p>
          <p style={{ color: card.color, fontSize: '20px', fontWeight: '700', margin: 0 }}>{card.value}</p>
        </div>
      ))}
    </div>
  )}

      {/* Create form */}
      {showForm && (
        <div style={{
          backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '24px',
          marginBottom: '24px', border: '1px solid rgba(52,211,153,0.15)',
        }}>
          <h3 style={{ color: '#f0fdf4', fontSize: '16px', fontWeight: '600', margin: '0 0 20px 0' }}>New Goal</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Goal Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Emergency Fund"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Target Amount ($)</label>
              <input
                type="number"
                value={form.target_amount || ''}
                onChange={e => setForm(f => ({ ...f, target_amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Target Date</label>
              <input
                type="date"
                value={form.target_date}
                onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
                style={inputStyle}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this goal for?"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSubmit} disabled={submitting} style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #059669, #34d399)',
              color: '#fff', border: 'none', borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600',
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Saving...' : 'Create Goal'}
            </button>
            <button onClick={resetForm} style={{
              padding: '10px 20px', backgroundColor: 'transparent',
              color: '#4b7a64', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deposit modal */}
      {depositGoalId && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '28px',
            border: '1px solid rgba(52,211,153,0.2)', width: '360px',
          }}>
            <h3 style={{ color: '#f0fdf4', fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0' }}>
              Make a Deposit
            </h3>
            <p style={{ color: '#4b7a64', fontSize: '13px', margin: '0 0 20px 0' }}>
              {goals.find(g => g.id === depositGoalId)?.name}
            </p>
            <label style={labelStyle}>Amount ($)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              style={{ ...inputStyle, marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleDeposit} disabled={submitting} style={{
                flex: 1, padding: '10px',
                background: 'linear-gradient(135deg, #059669, #34d399)',
                color: '#fff', border: 'none', borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '600',
                opacity: submitting ? 0.7 : 1,
              }}>
                {submitting ? 'Processing...' : 'Deposit'}
              </button>
              <button onClick={() => { setDepositGoalId(null); setDepositAmount(''); }} style={{
                flex: 1, padding: '10px', backgroundColor: 'transparent',
                color: '#4b7a64', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['All', 'Active', 'Completed'].map(f => (
          <button key={f} onClick={() => setFilterCompleted(f as any)} style={{
            padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px',
            backgroundColor: filterCompleted === f ? 'rgba(52,211,153,0.15)' : 'transparent',
            color: filterCompleted === f ? '#34d399' : '#4b7a64',
            fontWeight: filterCompleted === f ? '600' : '400',
          }}>{f}</button>
        ))}
        <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />
        {['All', 'Low', 'Medium', 'High'].map(p => (
          <button key={p} onClick={() => setFilterPriority(p)} style={{
            padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px',
            backgroundColor: filterPriority === p ? 'rgba(52,211,153,0.1)' : 'transparent',
            color: filterPriority === p ? '#34d399' : '#4b7a64',
            fontWeight: filterPriority === p ? '600' : '400',
          }}>{p}</button>
        ))}
      </div>

      {/* Goal cards */}
      {filteredGoals.length === 0 ? (
        <div style={{
          backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '60px',
          border: '1px solid rgba(52,211,153,0.08)', textAlign: 'center',
        }}>
          <p style={{ color: '#4b7a64', fontSize: '16px', margin: '0 0 8px 0' }}>No goals found</p>
          <p style={{ color: '#2d4a38', fontSize: '13px' }}>Create a goal to start tracking your savings</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {filteredGoals.map(g => (
            <div key={g.id} style={{
              backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '20px',
              border: `1px solid ${g.is_completed ? 'rgba(52,211,153,0.2)' : 'rgba(52,211,153,0.08)'}`,
              opacity: g.is_completed ? 0.85 : 1,
            }}>
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px' }}>
                <div style={{ flex: 1, marginRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ color: '#f0fdf4', fontSize: '15px', fontWeight: '600', margin: 0 }}>{g.name}</p>
                    {g.is_completed && (
                      <span style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Complete
                      </span>
                    )}
                  </div>
                  {g.description && (
                    <p style={{ color: '#4b7a64', fontSize: '12px', margin: 0 }}>{g.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{
                    backgroundColor: PRIORITY_BG[g.priority],
                    color: PRIORITY_COLORS[g.priority],
                    fontSize: '10px', fontWeight: '700',
                    padding: '3px 8px', borderRadius: '10px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    {g.priority}
                  </span>
                  <button onClick={() => handleDelete(g.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#4b7a64', padding: '4px', borderRadius: '4px',
                    display: 'flex', alignItems: 'center',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4b7a64')}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Amounts */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <p style={{ color: '#4b7a64', fontSize: '11px', margin: '0 0 2px 0' }}>Saved</p>
                  <p style={{ color: '#34d399', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    ${g.current_amount.toFixed(2)}
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#4b7a64', fontSize: '11px', margin: '0 0 2px 0' }}>Progress</p>
                  <p style={{ color: '#f0fdf4', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    {g.percentage_completed.toFixed(0)}%
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#4b7a64', fontSize: '11px', margin: '0 0 2px 0' }}>Target</p>
                  <p style={{ color: '#f0fdf4', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    ${g.target_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: '#0d1f15', borderRadius: '3px', marginBottom: '12px' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(g.percentage_completed, 100)}%`,
                  background: g.is_completed
                    ? 'linear-gradient(90deg, #059669, #34d399)'
                    : 'linear-gradient(90deg, #065f46, #34d399)',
                  borderRadius: '3px',
                  transition: 'width 0.4s ease',
                }} />
              </div>

              {/* Footer info + deposit button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#4b7a64', fontSize: '11px', margin: 0 }}>
                    {g.is_completed
                      ? '🎉 Goal reached!'
                      : `${g.days_remaining}d left · $${g.monthly_deposit_needed.toFixed(0)}/mo needed`
                    }
                  </p>
                </div>
                {!g.is_completed && (
                  <button
                    onClick={() => { setDepositGoalId(g.id); setDepositAmount(''); }}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: 'rgba(52,211,153,0.1)',
                      border: '1px solid rgba(52,211,153,0.2)',
                      borderRadius: '6px', color: '#34d399',
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(52,211,153,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(52,211,153,0.1)')}
                  >
                    + Deposit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#4b7a64', fontSize: '11px', fontWeight: '600',
  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  backgroundColor: '#071008',
  border: '1px solid rgba(52,211,153,0.15)',
  borderRadius: '8px', color: '#f0fdf4',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

export default Goals;