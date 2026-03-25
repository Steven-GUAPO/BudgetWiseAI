import React, { useState, useEffect } from 'react';
import goalService from '../services/goal.service';
import { Goal, GoalCreate } from '../types/goal.types';

const PRIORITY_COLORS = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444' };
const PRIORITY_BG    = { low: 'rgba(59,130,246,0.12)', medium: 'rgba(245,158,11,0.12)', high: 'rgba(239,68,68,0.12)' };

// Auto-pick an emoji based on goal name keywords
const goalEmoji = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('car'))        return '🚗';
  if (n.includes('house') || n.includes('home')) return '🏠';
  if (n.includes('travel') || n.includes('trip') || n.includes('vacation')) return '✈️';
  if (n.includes('emergency'))  return '🛡️';
  if (n.includes('education') || n.includes('school') || n.includes('college')) return '🎓';
  if (n.includes('wedding'))    return '💍';
  if (n.includes('baby') || n.includes('child')) return '👶';
  if (n.includes('retire'))     return '🌅';
  if (n.includes('invest'))     return '📈';
  if (n.includes('laptop') || n.includes('computer') || n.includes('tech')) return '💻';
  if (n.includes('phone'))      return '📱';
  if (n.includes('health') || n.includes('gym') || n.includes('fitness')) return '💪';
  if (n.includes('business'))   return '💼';
  if (n.includes('gift'))       return '🎁';
  return '🎯';
};

// SVG circular progress ring
const CircleProgress: React.FC<{ pct: number; completed: boolean; size?: number }> = ({
  pct, completed, size = 64,
}) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(pct, 100) / 100;
  const stroke = completed ? '#34d399' : pct >= 75 ? '#34d399' : pct >= 40 ? '#f59e0b' : '#3b82f6';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={stroke} strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - filled)}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
};

const Goals: React.FC = () => {
  const [goals,           setGoals]           = useState<Goal[]>([]);
  const [summary,         setSummary]         = useState<any>(null);
  const [loading,         setLoading]         = useState(true);
  const [showForm,        setShowForm]        = useState(false);
  const [depositGoalId,   setDepositGoalId]   = useState<string | null>(null);
  const [depositAmount,   setDepositAmount]   = useState('');
  const [error,           setError]           = useState('');
  const [submitting,      setSubmitting]      = useState(false);
  const [filterPriority,  setFilterPriority]  = useState('All');
  const [filterCompleted, setFilterCompleted] = useState<'All' | 'Active' | 'Completed'>('Active');
  const [hoveredCard,     setHoveredCard]     = useState<string | null>(null);

  const [form, setForm] = useState<GoalCreate>({
    name: '', description: '', target_amount: 0, target_date: '', priority: 'medium',
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
    if (!form.name.trim())                         { setError('Goal name is required');       return; }
    if (!form.target_amount || form.target_amount <= 0) { setError('Enter a valid target amount'); return; }
    if (!form.target_date)                         { setError('Target date is required');     return; }
    try {
      setSubmitting(true); setError('');
      await goalService.createGoal({ ...form, target_date: new Date(form.target_date + 'T12:00:00').toISOString() });
      await fetchAll();
      resetForm();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to create goal');
    } finally { setSubmitting(false); }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { setError('Enter a valid deposit amount'); return; }
    try {
      setSubmitting(true); setError('');
      await goalService.makeDeposit(depositGoalId!, { amount });
      await fetchAll();
      setDepositGoalId(null); setDepositAmount('');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to make deposit');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalService.deleteGoal(id);
      await fetchAll();
    } catch { setError('Failed to delete goal'); }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', target_amount: 0, target_date: '', priority: 'medium' });
    setShowForm(false);
  };

  const filteredGoals = goals.filter(g => {
    if (filterPriority !== 'All' && g.priority !== filterPriority.toLowerCase()) return false;
    if (filterCompleted === 'Active'    && g.is_completed)  return false;
    if (filterCompleted === 'Completed' && !g.is_completed) return false;
    return true;
  });

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '3px solid rgba(52,211,153,0.15)',
        borderTop: '3px solid #34d399',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#4b7a64', fontSize: '14px', margin: 0 }}>Loading goals…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const activeCount    = summary?.active_goals    ?? goals.filter(g => !g.is_completed).length;
  const completedCount = summary?.completed_goals ?? goals.filter(g =>  g.is_completed).length;

  return (
    <div>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(0.95); }      to { opacity:1; transform:scale(1); } }
        @keyframes spin     { to   { transform:rotate(360deg); } }
        @keyframes shimmer  { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        .goal-card { animation: fadeUp 0.35s ease both; }
        .goal-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 32px rgba(52,211,153,0.08) !important; }
        .deposit-btn:hover { background: rgba(52,211,153,0.2) !important; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
            Savings Goals
          </h1>
          <p style={{ color: '#4b7a64', margin: '4px 0 0', fontSize: '14px' }}>
            {activeCount} active · {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            color: '#fff', border: 'none', borderRadius: '10px',
            cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            boxShadow: '0 4px 14px rgba(52,211,153,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(52,211,153,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 14px rgba(52,211,153,0.25)'; }}
        >
          + New Goal
        </button>
      </div>

      {/* ── Error banner ───────────────────────────────────── */}
      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', padding: '0' }}>✕</button>
        </div>
      )}

      {/* ── Summary cards ──────────────────────────────────── */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {([
            { label: 'Total Target',     value: `$${(summary.total_target     ?? 0).toFixed(2)}`, icon: '🎯', color: '#f0fdf4' },
            { label: 'Total Saved',      value: `$${(summary.total_saved      ?? 0).toFixed(2)}`, icon: '💰', color: '#34d399' },
            { label: 'Still Needed',     value: `$${(summary.total_remaining  ?? 0).toFixed(2)}`, icon: '⏳', color: '#f87171' },
            { label: 'Overall Progress', value: `${(summary.percentage_completed ?? summary.percentage_complete ?? 0).toFixed(1)}%`, icon: '📊', color: '#34d399' },
          ] as const).map((card, i) => (
            <div key={card.label} style={{
              backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '18px',
              border: '1px solid rgba(52,211,153,0.08)',
              animation: `fadeUp 0.35s ${i * 0.06}s both`,
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '18px' }}>{card.icon}</span>
                <p style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                  {card.label}
                </p>
              </div>
              <p style={{ color: card.color, fontSize: '22px', fontWeight: '700', margin: 0 }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Create-goal modal ──────────────────────────────── */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
        }}
          onClick={e => { if (e.target === e.currentTarget) resetForm(); }}
        >
          <div style={{
            backgroundColor: '#0c1a0f', borderRadius: '16px', padding: '32px',
            border: '1px solid rgba(52,211,153,0.18)', width: '520px', maxWidth: '95vw',
            animation: 'scaleIn 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#f0fdf4', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                🎯 New Savings Goal
              </h3>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#4b7a64', cursor: 'pointer', fontSize: '20px', padding: '0' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Goal Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Emergency Fund" style={inputStyle} autoFocus />
              </div>
              <div>
                <label style={labelStyle}>Target Amount ($)</label>
                <input type="number" value={form.target_amount || ''} onChange={e => setForm(f => ({ ...f, target_amount: parseFloat(e.target.value) || 0 }))} placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Target Date</label>
                <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Priority</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                      flex: 1, padding: '9px', borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${form.priority === p ? PRIORITY_COLORS[p] : 'rgba(255,255,255,0.08)'}`,
                      backgroundColor: form.priority === p ? PRIORITY_BG[p] : 'transparent',
                      color: form.priority === p ? PRIORITY_COLORS[p] : '#4b7a64',
                      fontSize: '13px', fontWeight: '600', textTransform: 'capitalize',
                      transition: 'all 0.15s',
                    }}>
                      {p === 'low' ? '🔵' : p === 'medium' ? '🟡' : '🔴'} {p}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Description (optional)</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this goal for?" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={handleSubmit} disabled={submitting} style={{
                flex: 1, padding: '12px',
                background: 'linear-gradient(135deg, #059669, #34d399)',
                color: '#fff', border: 'none', borderRadius: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '600', opacity: submitting ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}>
                {submitting ? 'Creating…' : '✓ Create Goal'}
              </button>
              <button onClick={resetForm} style={{
                padding: '12px 20px', backgroundColor: 'transparent',
                color: '#4b7a64', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deposit modal ──────────────────────────────────── */}
      {depositGoalId && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
        }}
          onClick={e => { if (e.target === e.currentTarget) { setDepositGoalId(null); setDepositAmount(''); } }}
        >
          <div style={{
            backgroundColor: '#0c1a0f', borderRadius: '16px', padding: '32px',
            border: '1px solid rgba(52,211,153,0.2)', width: '380px', maxWidth: '95vw',
            animation: 'scaleIn 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ color: '#f0fdf4', fontSize: '18px', fontWeight: '700', margin: 0 }}>💸 Add Deposit</h3>
              <button onClick={() => { setDepositGoalId(null); setDepositAmount(''); }} style={{ background: 'none', border: 'none', color: '#4b7a64', cursor: 'pointer', fontSize: '20px', padding: '0' }}>✕</button>
            </div>
            <p style={{ color: '#4b7a64', fontSize: '13px', margin: '0 0 24px 0' }}>
              {goals.find(g => g.id === depositGoalId)?.name}
            </p>
            <label style={labelStyle}>Amount ($)</label>
            <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="0.00" autoFocus style={{ ...inputStyle, marginBottom: '24px', fontSize: '18px', fontWeight: '600' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleDeposit} disabled={submitting} style={{
                flex: 1, padding: '12px',
                background: 'linear-gradient(135deg, #059669, #34d399)',
                color: '#fff', border: 'none', borderRadius: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '600', opacity: submitting ? 0.7 : 1,
              }}>
                {submitting ? 'Processing…' : '+ Deposit'}
              </button>
              <button onClick={() => { setDepositGoalId(null); setDepositAmount(''); }} style={{
                flex: 1, padding: '12px', backgroundColor: 'transparent',
                color: '#4b7a64', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {(['All', 'Active', 'Completed'] as const).map(f => (
          <button key={f} onClick={() => setFilterCompleted(f)} style={{
            padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px',
            backgroundColor: filterCompleted === f ? 'rgba(52,211,153,0.15)' : 'transparent',
            color: filterCompleted === f ? '#34d399' : '#4b7a64',
            fontWeight: filterCompleted === f ? '600' : '400',
            transition: 'all 0.15s',
          }}>{f}</button>
        ))}
        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />
        {(['All', 'Low', 'Medium', 'High'] as const).map(p => (
          <button key={p} onClick={() => setFilterPriority(p)} style={{
            padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px',
            backgroundColor: filterPriority === p ? 'rgba(52,211,153,0.1)' : 'transparent',
            color: filterPriority === p ? '#34d399' : '#4b7a64',
            fontWeight: filterPriority === p ? '600' : '400',
            transition: 'all 0.15s',
          }}>{p}</button>
        ))}
        <span style={{ marginLeft: 'auto', color: '#4b7a64', fontSize: '13px' }}>
          {filteredGoals.length} goal{filteredGoals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Empty state ────────────────────────────────────── */}
      {filteredGoals.length === 0 ? (
        <div style={{
          backgroundColor: '#0c1a0f', borderRadius: '16px', padding: '72px 40px',
          border: '1px solid rgba(52,211,153,0.08)', textAlign: 'center',
          animation: 'fadeUp 0.35s ease',
        }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', animation: 'shimmer 2s infinite' }}>🎯</div>
          <p style={{ color: '#f0fdf4', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>No goals yet</p>
          <p style={{ color: '#4b7a64', fontSize: '14px', margin: '0 0 24px 0' }}>Create your first savings goal to start tracking your progress</p>
          <button onClick={() => setShowForm(true)} style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            color: '#fff', border: 'none', borderRadius: '10px',
            cursor: 'pointer', fontSize: '14px', fontWeight: '600',
          }}>
            + Create a Goal
          </button>
        </div>
      ) : (
        /* ── Goal cards grid ─────────────────────────────── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {filteredGoals.map((g, idx) => {
            const pct       = g.percentage_completed ?? g.percentage_complete ?? 0;
            const daysLeft  = Math.max(0, Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000));
            const isHovered = hoveredCard === g.id;

            return (
              <div
                key={g.id}
                className="goal-card"
                onMouseEnter={() => setHoveredCard(g.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: '#0c1a0f', borderRadius: '14px', padding: '22px',
                  border: `1px solid ${isHovered ? 'rgba(52,211,153,0.22)' : g.is_completed ? 'rgba(52,211,153,0.18)' : 'rgba(52,211,153,0.08)'}`,
                  opacity: g.is_completed ? 0.88 : 1,
                  transition: 'all 0.25s ease',
                  animationDelay: `${idx * 0.07}s`,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Completed shimmer overlay */}
                {g.is_completed && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: 'linear-gradient(135deg, transparent 60%, rgba(52,211,153,0.06))',
                    width: '100%', height: '100%', pointerEvents: 'none',
                  }} />
                )}

                {/* ── Card header ─────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  {/* Left: emoji + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, marginRight: '12px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                      backgroundColor: 'rgba(52,211,153,0.08)',
                      border: '1px solid rgba(52,211,153,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px',
                    }}>
                      {goalEmoji(g.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                        <p style={{ color: '#f0fdf4', fontSize: '15px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</p>
                        {g.is_completed && (
                          <span style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                            ✓ Done
                          </span>
                        )}
                      </div>
                      {g.description && (
                        <p style={{ color: '#4b7a64', fontSize: '12px', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: priority + delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{
                      backgroundColor: PRIORITY_BG[g.priority], color: PRIORITY_COLORS[g.priority],
                      fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {g.priority}
                    </span>
                    <button onClick={() => handleDelete(g.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#4b7a64', padding: '4px', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#4b7a64')}
                      title="Delete goal"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* ── Progress section ─────────── */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  {/* Circular ring */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <CircleProgress pct={pct} completed={g.is_completed} size={68} />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#f0fdf4', fontSize: '13px', fontWeight: '700' }}>{Math.round(pct)}%</span>
                    </div>
                  </div>

                  {/* Amounts column */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <p style={{ color: '#4b7a64', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 2px' }}>Saved</p>
                        <p style={{ color: '#34d399', fontSize: '18px', fontWeight: '700', margin: 0 }}>${g.current_amount.toFixed(2)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#4b7a64', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 2px' }}>Target</p>
                        <p style={{ color: '#f0fdf4', fontSize: '18px', fontWeight: '700', margin: 0 }}>${g.target_amount.toFixed(2)}</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ width: '100%', height: '5px', backgroundColor: '#0d1f15', borderRadius: '3px' }}>
                      <div style={{
                        height: '100%', width: `${Math.min(pct, 100)}%`,
                        background: g.is_completed ? 'linear-gradient(90deg, #059669, #34d399)' : 'linear-gradient(90deg, #065f46, #34d399)',
                        borderRadius: '3px', transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                </div>

                {/* ── Footer ───────────────────── */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div>
                    {g.is_completed ? (
                      <p style={{ color: '#34d399', fontSize: '12px', fontWeight: '600', margin: 0 }}>🎉 Goal reached!</p>
                    ) : (
                      <>
                        <p style={{ color: '#4b7a64', fontSize: '12px', margin: 0 }}>
                          <span style={{ color: daysLeft <= 30 ? '#f87171' : '#4b7a64' }}>{daysLeft}d left</span>
                          {' · '}
                          <span style={{ color: '#f0fdf4' }}>${(g.monthly_deposit_needed ?? 0).toFixed(0)}/mo</span> needed
                        </p>
                        <p style={{ color: '#2d4a38', fontSize: '11px', margin: '3px 0 0' }}>
                          Due {new Date(g.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </>
                    )}
                  </div>
                  {!g.is_completed && (
                    <button
                      className="deposit-btn"
                      onClick={() => { setDepositGoalId(g.id); setDepositAmount(''); }}
                      style={{
                        padding: '7px 16px',
                        backgroundColor: 'rgba(52,211,153,0.1)',
                        border: '1px solid rgba(52,211,153,0.2)',
                        borderRadius: '8px', color: '#34d399',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      + Deposit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
  width: '100%', padding: '10px 12px',
  backgroundColor: '#071008',
  border: '1px solid rgba(52,211,153,0.15)',
  borderRadius: '8px', color: '#f0fdf4',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

export default Goals;
