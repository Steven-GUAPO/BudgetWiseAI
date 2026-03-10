import React from 'react';

const SpendingOutlook: React.FC = () => (
  <div>
    <div style={{ marginBottom: '32px' }}>
      <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
        Spending Outlook
      </h1>
      <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
        AI-powered spending forecasts and trends
      </p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
      {['Spending Forecast', 'Trend Analysis', 'Spending Alerts'].map(card => (
        <div key={card} style={{
          backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '24px',
          border: '1px solid rgba(52,211,153,0.08)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <p style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>{card}</p>
          <p style={{ color: '#4b7a64', fontSize: '12px' }}>Coming soon</p>
        </div>
      ))}
    </div>
  </div>
);

export default SpendingOutlook;