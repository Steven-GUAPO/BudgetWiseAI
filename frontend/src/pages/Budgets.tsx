import React, { useState, useEffect } from 'react';
import budgetService from '../services/budget.service';
import { Budget, BudgetCreate } from '../types/budget.types';

const CATEGORIES = [
  'Groceries', 'Transportation', 'Entertainment', 'Shopping',
  'Dining', 'Bills', 'Healthcare', 'Education', 'Other'
];

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (err: any) {
      setError('Failed to load budgets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    setError('');

    if (!formData.category || !formData.limit) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const budgetData: BudgetCreate = {
        category: formData.category,
        limit: parseFloat(formData.limit),
      };

      await budgetService.createBudget(budgetData);
      setShowCreateModal(false);
      setFormData({ category: '', limit: '' });
      fetchBudgets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create budget');
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget) return;

    try {
      await budgetService.updateBudget(editingBudget.id, {
        limit: parseFloat(formData.limit),
      });
      setEditingBudget(null);
      setFormData({ category: '', limit: '' });
      setShowCreateModal(false);
      fetchBudgets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await budgetService.deleteBudget(id);
      fetchBudgets();
    } catch (err: any) {
      setError('Failed to delete budget');
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
    setFormData({ category: '', limit: '' });
    setError('');
  };

  const getProgressColor = (budget: Budget) => {
    if (budget.is_over_budget) return '#EF4444';
    if (budget.percentage_used > 80) return '#F59E0B';
    return '#10B981';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: '#ffffff', fontSize: '20px' }}>Loading budgets...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a110e',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <div>
            <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700', margin: 0 }}>
              Budgets
            </h1>
            <p style={{ color: '#a0a0a0', fontSize: '16px', marginTop: '8px' }}>
              Track your spending limits by category
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#0a110e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + Create Budget
          </button>
        </div>

        {budgets.length === 0 && (
          <div style={{
            backgroundColor: '#0a110e',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💰</div>
            <h3 style={{ color: '#ffffff', fontSize: '24px', marginBottom: '12px' }}>
              No budgets yet
            </h3>
            <p style={{ color: '#a0a0a0', fontSize: '16px', marginBottom: '24px' }}>
              Create your first budget to start tracking your spending
            </p>
          </div>
        )}

        {budgets.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}>
            {budgets.map((budget) => (
              <div
                key={budget.id}
                style={{
                  backgroundColor: '#0a110e',
                  borderRadius: '12px',
                  padding: '24px',
                  border: `2px solid ${budget.is_over_budget ? '#EF4444' : '#4a4a4a'}`,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '20px',
                }}>
                  <div>
                    <h3 style={{
                      color: '#ffffff',
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '4px',
                    }}>
                      {budget.category}
                    </h3>
                    <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>
                      {budget.month} {budget.year}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => openEditModal(budget)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e94560',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff4444',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}>
                    <span style={{ color: '#a0a0a0', fontSize: '15px' }}>
                      ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </span>
                    <span style={{
                      color: getProgressColor(budget),
                      fontSize: '16px',
                      fontWeight: '700',
                    }}>
                      {budget.percentage_used.toFixed(1)}%
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '10px',
                    backgroundColor: '#0a110e',
                    borderRadius: '5px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.min(budget.percentage_used, 100)}%`,
                      height: '100%',
                      backgroundColor: getProgressColor(budget),
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {budget.is_over_budget && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginTop: '16px',
                  }}>
                    <p style={{
                      color: '#EF4444',
                      fontSize: '14px',
                      margin: 0,
                      fontWeight: '500',
                    }}>
                      ⚠️ Over budget by ${(budget.spent - budget.limit).toFixed(2)}
                    </p>
                  </div>
                )}

                {!budget.is_over_budget && budget.remaining > 0 && (
                  <p style={{
                    color: '#10B981',
                    fontSize: '14px',
                    marginTop: '16px',
                    fontWeight: '500',
                  }}>
                    ✓ ${budget.remaining.toFixed(2)} remaining
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }} onClick={closeModal}>
            <div style={{
              backgroundColor: '#0a110e',
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
            }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '24px',
              }}>
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </h2>

              {error && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}>
                  <p style={{ color: '#EF4444', fontSize: '14px', margin: 0 }}>
                    {error}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={!!editingBudget}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#0a110e',
                    border: '1px solid #4a4a4a',
                    borderRadius: '8px',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  Monthly Limit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  placeholder="500.00"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#0a110e',
                    border: '1px solid #4a4a4a',
                    borderRadius: '8px',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundColor: '#0a110e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={editingBudget ? handleUpdateBudget : handleCreateBudget}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundColor: '#0a110e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {editingBudget ? 'Update' : 'Create'}
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