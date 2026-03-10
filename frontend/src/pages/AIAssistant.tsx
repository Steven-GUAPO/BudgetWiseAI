import React from 'react';

const AIAssistant: React.FC = () => (
  <div>
    <div style={{ marginBottom: '32px' }}>
      <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
        AI Assistant
      </h1>
      <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
        Your personal finance advisor
      </p>
    </div>
    <div style={{
      backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '60px',
      border: '1px solid rgba(52,211,153,0.08)', textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
      <p style={{ color: '#f0fdf4', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
        AI Assistant Coming Soon
      </p>
      <p style={{ color: '#4b7a64', fontSize: '14px' }}>
        Your AI-powered financial advisor is being set up. Check back soon!
      </p>
    </div>
  </div>
);

export default AIAssistant;