import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at: string | null;
  category: string;
}

interface RewardsData {
  badges: Badge[];
  total_earned: number;
  total_badges: number;
  points: number;
}

const CATEGORY_ORDER = ['Transactions', 'Budgets', 'Goals'];

const Rewards: React.FC = () => {
  const [data, setData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await api.get<RewardsData>('/rewards');
        setData(response.data);
      } catch {
        setError('Failed to load rewards');
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#4b7a64', fontSize: '15px' }}>Loading rewards...</div>
    </div>
  );

  if (error) return (
    <div style={{ color: '#f87171', padding: '20px' }}>{error}</div>
  );

  if (!data) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
          Rewards
        </h1>
        <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
          {data.total_earned} of {data.total_badges} badges earned · {data.points} points
        </p>
      </div>

      {/* Progress + points */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '24px',
          border: '1px solid rgba(52,211,153,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600' }}>Overall Progress</span>
            <span style={{ color: '#34d399', fontSize: '14px', fontWeight: '600' }}>
              {data.total_earned}/{data.total_badges}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#0d1f15', borderRadius: '4px' }}>
            <div style={{
              height: '100%',
              width: `${(data.total_earned / data.total_badges) * 100}%`,
              background: 'linear-gradient(90deg, #059669, #34d399)',
              borderRadius: '4px',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ color: '#4b7a64', fontSize: '12px', margin: '8px 0 0 0' }}>
            {data.total_badges - data.total_earned} badges remaining
          </p>
        </div>

        <div style={{
          backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '24px',
          border: '1px solid rgba(52,211,153,0.08)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        }}>
          <p style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px 0' }}>
            Total Points
          </p>
          <p style={{ color: '#34d399', fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
            {data.points}
          </p>
        </div>
      </div>

      {/* Badges by category */}
      {CATEGORY_ORDER.map(category => {
        const categoryBadges = data.badges.filter(b => b.category === category);
        const earnedInCategory = categoryBadges.filter(b => b.earned).length;

        return (
          <div key={category} style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ color: '#d1fae5', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                {category}
              </h2>
              <span style={{ color: '#4b7a64', fontSize: '12px' }}>
                {earnedInCategory}/{categoryBadges.length}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {categoryBadges.map(badge => (
                <div key={badge.id} style={{
                  backgroundColor: '#0c1a0f',
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${badge.earned ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.04)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  opacity: badge.earned ? 1 : 0.45,
                  transition: 'opacity 0.2s',
                }}>
                  <div style={{
                    fontSize: '28px',
                    filter: badge.earned ? 'none' : 'grayscale(1)',
                    flexShrink: 0,
                  }}>
                    {badge.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <p style={{ color: badge.earned ? '#f0fdf4' : '#4b7a64', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                        {badge.name}
                      </p>
                      {badge.earned && (
                        <span style={{
                          backgroundColor: 'rgba(52,211,153,0.12)',
                          color: '#34d399', fontSize: '9px', fontWeight: '700',
                          padding: '2px 6px', borderRadius: '8px',
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          flexShrink: 0,
                        }}>✓</span>
                      )}
                    </div>
                    <p style={{ color: '#4b7a64', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
                      {badge.description}
                    </p>
                    {badge.earned && badge.earned_at && (
                      <p style={{ color: '#2d4a38', fontSize: '10px', margin: '4px 0 0 0' }}>
                        Earned {new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Rewards;