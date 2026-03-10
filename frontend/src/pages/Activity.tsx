import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import transactionService, { Transaction } from '../services/transaction.service';

const CATEGORIES = ['All', 'Shopping', 'Food', 'Utilities', 'Entertainment', 'Transportation', 'Healthcare', 'Education', 'Income', 'Other'];

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

const Activity: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchTransactions();
    // Auto Sync in background
    api.post('/bank/sync').catch(() => {});
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, selectedCategory, selectedType, searchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...transactions];
    if (selectedCategory !== 'All') result = result.filter(t => t.category === selectedCategory);
    if (selectedType !== 'All') result = result.filter(t => t.transaction_type === selectedType);
    if (searchTerm) result = result.filter(t =>
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(result);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/bank/sync');
      await fetchTransactions();
   } catch (e: any) {
      setError(e.response?.data?.detail || 'Sync failed — make sure your bank is connected');
    } finally {
     setSyncing(false);
   }
  };

  const totalIncome = filtered.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div style={{ color: '#666', fontSize: '16px' }}>Loading transactions...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
            Activity
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '14px' }}>
            {filtered.length} transactions
          </p>
        </div>
</div>
      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Income', value: `+$${totalIncome.toFixed(2)}`, color: '#22c55e' },
          { label: 'Total Expenses', value: `-$${totalExpenses.toFixed(2)}`, color: '#ef4444' },
          { label: 'Net', value: `$${(totalIncome - totalExpenses).toFixed(2)}`, color: totalIncome - totalExpenses >= 0 ? '#22c55e' : '#ef4444' },
        ].map((card) => (
          <div key={card.label} style={{
            backgroundColor: '#0a110e',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>{card.label}</p>
            <p style={{ color: card.color, fontSize: '22px', fontWeight: '700', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#0a110e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Search merchant or category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 14px',
            backgroundColor: '#0a110e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{
            padding: '8px 14px',
            backgroundColor: '#0a110e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          style={{
            padding: '8px 14px',
            backgroundColor: '#0a110e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {['All', 'income', 'expense'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Transaction list */}
      <div style={{
        backgroundColor: '#0a110e',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No transactions found</p>
            <p style={{ fontSize: '13px' }}>Try generating sample data or adjusting your filters</p>
          </div>
        ) : (
          filtered.map((txn, index) => (
            <div
              key={txn.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: index < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {/* Category dot */}
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '10px',
                backgroundColor: `${CATEGORY_COLORS[txn.category] || '#6b7280'}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: '14px',
                flexShrink: 0,
              }}>
                <div style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  backgroundColor: CATEGORY_COLORS[txn.category] || '#6b7280',
                }} />
              </div>

              {/* Merchant + category */}
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                  {txn.merchant}
                </p>
                <p style={{ color: '#555', fontSize: '12px', margin: '2px 0 0 0' }}>
                  {txn.category} · {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Amount */}
              <span style={{
                fontSize: '15px',
                fontWeight: '600',
                color: txn.transaction_type === 'income' ? '#22c55e' : '#ef4444',
              }}>
                {txn.transaction_type === 'income' ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Activity;