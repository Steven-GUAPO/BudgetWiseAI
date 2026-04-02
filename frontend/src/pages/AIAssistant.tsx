import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import {useAuth} from '../context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionChip[];
}

interface ActionChip {
  label: string;
  prompt: string;
}

const SUGGESTED_PROMPTS = [
  { label: 'Summarize my spending', prompt: 'Give me a summary of my spending this month.'},
  {label: 'Am I on track?', prompt: 'Am I on track with my budget this month?'},
  {label: 'Create a savings goal', prompt: 'Help me create a savings goal.'},
  {label: 'Top spending categories', prompt:'What are my top spending categories?'},

];

const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: 'rgba(52,211,153,0.5)',
        animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </div>
);

const AIAssistant: React.FC = () => {
  const { user } = useAuth() as any;
  const firstName = user?.first_name || user?.username || 'there';
     

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${firstName}! I'm your AI financial assistant. Ask me anything about your spending, budgets, or savings goals!`,
      actions: [
        { label: 'Summarize my spending', prompt: 'Give me a summary of my spending this month.' },
        { label: 'Check my budgets', prompt: 'How are my budgets looking this month?' },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isOnline] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai/history');
      if (response.data.length > 0) {
        setMessages(response.data.map((m: any) => ({
          role: m.role,
          content: m.content,
        })));
      }
    } catch {
      // No history yet, keep default welcome message
    } finally {
      setHistoryLoaded(true);
    }
  };

  const clearHistory = async () => {
    try {
      await api.delete('/ai/history');
      setMessages([{
        role: 'assistant',
        content: `Hi ${firstName}! I'm your AI financial advisor. Ask me anything about your spending, budgets, or savings goals!`,
        actions: [
          { label: 'Summarize my spending', prompt: 'Give me a summary of my spending this month.' },
          { label: 'Check my budgets', prompt: 'How are my budgets looking this month?' },
        ],
      }]);
    } catch { }
  };

  const sendMessage = async (text?: string) => {
    const userMessage = (text ?? input).trim();
    if (!userMessage || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const response = await api.post('/ai/chat', { message: userMessage });
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.data.reply,
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (response.data.actions?.length > 0) {
        response.data.actions.forEach((action: any) => {
          const labels: Record<string, string> = {
            goal_created: `Goal "${action.name}" has been created! View it on the Goals page.`,
            goal_updated: `Goal "${action.name}" has been updated!`,
            goal_deleted: `Goal "${action.name}" has been deleted.`,
            budget_created: `Budget for "${action.category}" has been created! View it on the Budgets page.`,
            budget_updated: `Budget for "${action.category}" has been updated!`,
            budget_deleted: `Budget for "${action.category}" has been deleted.`,
          };
          if (labels[action.type]) {
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ ${labels[action.type]}` }]);
          }
        });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const userInitials = (user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? user?.username?.[0] ?? '');

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ai-msg-bubble { animation: fadeSlideIn 0.25s ease; }
        .ai-chip-btn:hover { background: rgba(52,211,153,0.12) !important; border-color: rgba(52,211,153,0.4) !important; color: #34d399 !important; }
        .ai-send-btn:hover:not(:disabled) { background: linear-gradient(135deg,#047857,#10b981) !important; transform: translateY(-1px); }
        .ai-send-btn:active:not(:disabled) { transform: translateY(0); }
        .ai-clear-btn:hover { border-color: rgba(239,68,68,0.4) !important; color: #f87171 !important; }
        .ai-input:focus { border-color: rgba(52,211,153,0.5) !important; box-shadow: 0 0 0 3px rgba(52,211,153,0.08); }
        .ai-suggested:hover { background: rgba(52,211,153,0.1) !important; border-color: rgba(52,211,153,0.35) !important; color: #34d399 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(52,211,153,0.2); border-radius: 4px; }
      `}</style>
 
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', fontFamily: "'Inter', sans-serif" }}>
 
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #065f46, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', boxShadow: '0 0 0 3px rgba(52,211,153,0.15)',
            }}>🤖</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#f0fdf4', letterSpacing: '-0.3px' }}>
                AI Assistant
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: isOnline ? '#22c55e' : '#6b7280',
                  boxShadow: isOnline ? '0 0 6px #22c55e' : 'none',
                }} />
                <span style={{ fontSize: '12px', color: '#4b7a64' }}>
                  {isOnline ? 'Online · BudgetWise AI' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <button
            className="ai-clear-btn"
            onClick={clearHistory}
            style={{
              padding: '7px 16px', fontSize: '12px', cursor: 'pointer',
              background: 'transparent', color: '#4b7a64',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', transition: 'all 0.2s',
            }}
          >Clear history</button>
        </div>

      {/* Chat window */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: '#071008', borderRadius: '16px',
          border: '1px solid rgba(52,211,153,0.1)',
          overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!historyLoaded ? (
              <div style={{ color: '#4b7a64', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                Loading conversation...
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="ai-msg-bubble" style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: msg.role === 'assistant' ? '16px' : '12px',
                    fontWeight: '600',
                    background: msg.role === 'assistant'
                      ? 'linear-gradient(135deg,#065f46,#10b981)'
                      : 'linear-gradient(135deg,#1e3a5f,#2563eb)',
                    color: '#fff',
                    boxShadow: msg.role === 'assistant'
                      ? '0 0 0 2px rgba(52,211,153,0.2)'
                      : '0 0 0 2px rgba(59,130,246,0.2)',
                  }}>
                    {msg.role === 'assistant' ? '🤖' : userInitials.toUpperCase() || '?'}
                  </div>
 
                  {/* Bubble */}
                  <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                      background: msg.role === 'user'
                        ? 'rgba(37,99,235,0.18)'
                        : 'rgba(16,185,129,0.07)',
                      border: msg.role === 'user'
                        ? '1px solid rgba(59,130,246,0.25)'
                        : '1px solid rgba(52,211,153,0.12)',
                      color: '#e2fdf0', fontSize: '14px', lineHeight: '1.65',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </div>
 
                    {/* Action chips */}
                    {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {msg.actions.map((chip, ci) => (
                          <button
                            key={ci}
                            className="ai-chip-btn"
                            onClick={() => sendMessage(chip.prompt)}
                            style={{
                              fontSize: '12px', padding: '5px 12px',
                              borderRadius: '20px', cursor: 'pointer',
                              background: 'rgba(52,211,153,0.06)',
                              border: '1px solid rgba(52,211,153,0.2)',
                              color: '#6ee7b7', transition: 'all 0.2s',
                            }}
                          >{chip.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
 
            {/* Typing indicator */}
            {loading && (
              <div className="ai-msg-bubble" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#065f46,#10b981)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                }}>🤖</div>
                <div style={{
                  padding: '12px 16px', borderRadius: '2px 12px 12px 12px',
                  background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(52,211,153,0.12)',
                }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
 
          {/* Suggested prompts */}
          <div style={{ padding: '0 24px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button
                key={i}
                className="ai-suggested"
                onClick={() => sendMessage(p.prompt)}
                disabled={loading}
                style={{
                  fontSize: '12px', padding: '5px 14px', borderRadius: '20px',
                  cursor: 'pointer', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#4b7a64', transition: 'all 0.2s',
                }}
              >{p.label}</button>
            ))}
          </div>
 
          {/* Input bar */}
          <div style={{
            padding: '14px 20px', borderTop: '1px solid rgba(52,211,153,0.07)',
            display: 'flex', gap: '10px', alignItems: 'center',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <input
              ref={inputRef}
              className="ai-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about your spending, budgets, or savings..."
              style={{
                flex: 1, padding: '11px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(52,211,153,0.15)',
                borderRadius: '10px', color: '#e2fdf0',
                fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <button
              className="ai-send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: '11px 22px',
                background: loading || !input.trim()
                  ? 'rgba(52,211,153,0.08)'
                  : 'linear-gradient(135deg,#059669,#34d399)',
                color: loading || !input.trim() ? '#4b7a64' : '#fff',
                border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
 
export default AIAssistant;

export default AIAssistant;
