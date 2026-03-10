import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface LinkedAccount {
  id: string;
  account_type: string;
  last4: string;
  last_synced: string | null;
  is_active: boolean;
}

const Settings: React.FC = () => {
  const { user, setUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [bankMessage, setBankMessage] = useState('');
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const response = await api.get('/bank/accounts');
      setLinkedAccounts(response.data);
    } catch {
      // No accounts yet, that's fine
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError('');
      const response = await api.put('/auth/me', form);
      setUser(response.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setBankMessage('');
    try {
      await api.post('/bank/connect');
      await fetchLinkedAccounts();
      setBankMessage('✓ Bank connected successfully!');
    } catch (e: any) {
      setBankMessage(e.response?.data?.detail || 'Failed to connect bank');
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setBankMessage('');
    try {
      const response = await api.post('/bank/sync');
      setBankMessage(`✓ Synced ${response.data.synced} new transactions`);
    } catch (e: any) {
      setBankMessage(e.response?.data?.detail || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = linkedAccounts.length > 0;

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
          Settings
        </h1>
        <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
          Manage your account preferences
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Profile */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input
              value={form.first_name}
              onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              value={form.last_name}
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Username</label>
          <input
            value={user?.username || ''}
            disabled
            style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
          />
          <p style={{ color: '#2d4a38', fontSize: '11px', margin: '4px 0 0 0' }}>Username cannot be changed</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Email</label>
          <input
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <button onClick={handleSave} disabled={submitting} style={{
          padding: '10px 24px',
          background: saved ? 'rgba(52,211,153,0.2)' : 'linear-gradient(135deg, #059669, #34d399)',
          color: saved ? '#34d399' : '#fff',
          border: saved ? '1px solid rgba(52,211,153,0.3)' : 'none',
          borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer',
          fontSize: '14px', fontWeight: '600',
          opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
        }}>
          {submitting ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Bank Connection */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Bank Connection</h2>
        <p style={{ color: '#4b7a64', fontSize: '13px', margin: '0 0 20px 0' }}>
          Connect your Freedom Bank account to automatically import transactions.
        </p>

        {/* Connected accounts */}
        {isConnected && (
          <div style={{ marginBottom: '20px' }}>
            {linkedAccounts.map(account => (
              <div key={account.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', backgroundColor: '#071008',
                border: '1px solid rgba(52,211,153,0.15)',
                borderRadius: '8px', marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #059669, #34d399)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px',
                  }}>
                    {account.account_type === 'checking' ? '🏦' : '💳'}
                  </div>
                  <div>
                    <p style={{ color: '#f0fdf4', fontSize: '13px', fontWeight: '600', margin: 0, textTransform: 'capitalize' }}>
                      {account.account_type} Account
                    </p>
                    <p style={{ color: '#4b7a64', fontSize: '11px', margin: '2px 0 0 0' }}>
                      •••• {account.last4} · {account.last_synced
                        ? `Last synced ${new Date(account.last_synced).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                        : 'Never synced'}
                    </p>
                  </div>
                </div>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#34d399',
                }} />
              </div>
            ))}
          </div>
        )}

        {/* Bank message */}
        {bankMessage && (
          <div style={{
            backgroundColor: bankMessage.startsWith('✓')
              ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
            color: bankMessage.startsWith('✓') ? '#34d399' : '#f87171',
            padding: '10px 14px', borderRadius: '8px',
            fontSize: '13px', marginBottom: '16px',
          }}>
            {bankMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isConnected ? (
            <button onClick={handleConnect} disabled={connecting} style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #059669, #34d399)',
              color: '#fff', border: 'none', borderRadius: '8px',
              cursor: connecting ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600',
              opacity: connecting ? 0.7 : 1,
            }}>
              {connecting ? 'Connecting...' : '🏦 Connect Bank'}
            </button>
          ) : (
            <button onClick={handleSync} disabled={syncing} style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #059669, #34d399)',
              color: '#fff', border: 'none', borderRadius: '8px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600',
              opacity: syncing ? 0.7 : 1,
            }}>
              {syncing ? 'Syncing...' : '⟳ Sync Transactions'}
            </button>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Preferences</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Email notifications', description: 'Get notified when you exceed a budget' },
            { label: 'Weekly summary',       description: 'Receive a weekly spending report' },
            { label: 'Goal reminders',       description: 'Reminders to make goal deposits' },
          ].map(pref => (
            <div key={pref.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#d1fae5', fontSize: '14px', margin: 0, fontWeight: '500' }}>{pref.label}</p>
                <p style={{ color: '#4b7a64', fontSize: '12px', margin: '2px 0 0 0' }}>{pref.description}</p>
              </div>
              <div style={{
                width: '44px', height: '24px',
                backgroundColor: 'rgba(52,211,153,0.15)',
                borderRadius: '12px', border: '1px solid rgba(52,211,153,0.2)',
                cursor: 'not-allowed', opacity: 0.5,
                display: 'flex', alignItems: 'center', padding: '2px',
              }}>
                <div style={{ width: '18px', height: '18px', backgroundColor: '#4b7a64', borderRadius: '50%' }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: '#2d4a38', fontSize: '12px', margin: '16px 0 0 0' }}>
          Notification settings will be enabled in a future update
        </p>
      </div>

      {/* Danger zone */}
      <div style={{ ...sectionStyle, border: '1px solid rgba(239,68,68,0.15)' }}>
        <h2 style={{ ...sectionTitleStyle, color: '#f87171' }}>Danger Zone</h2>
        <p style={{ color: '#4b7a64', fontSize: '13px', margin: '0 0 16px 0' }}>
          These actions are permanent and cannot be undone.
        </p>
        <button style={{
          padding: '9px 20px', backgroundColor: 'transparent',
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
          color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '24px',
  border: '1px solid rgba(52,211,153,0.08)', marginBottom: '16px',
};
const sectionTitleStyle: React.CSSProperties = {
  color: '#f0fdf4', fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0',
};
const labelStyle: React.CSSProperties = {
  display: 'block', color: '#4b7a64', fontSize: '11px', fontWeight: '600',
  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', backgroundColor: '#071008',
  border: '1px solid rgba(52,211,153,0.15)', borderRadius: '8px',
  color: '#f0fdf4', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

export default Settings;