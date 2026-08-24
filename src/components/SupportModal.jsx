import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { supportChat } from '../lib/gemini';
import { useApp } from '../context/AppContext';

export default function SupportModal({ onClose }) {
  const { lang } = useApp();
  const [tab, setTab] = useState('ai');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setLoading(true);
    try {
      const reply = await supportChat(next, lang);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: "Sorry, something went wrong. Try again or reach us on WhatsApp." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          height: '580px',
          background: 'rgba(0, 22, 12, 0.98)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2 className="text-base font-semibold text-white">Support</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
          >
            <X size={18} className="text-white/55" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pt-3 pb-1 flex-shrink-0">
          <button
            onClick={() => setTab('ai')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={
              tab === 'ai'
                ? { background: '#F5A800', color: '#111' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            AI Support Agent
          </button>
          <button
            onClick={() => setTab('whatsapp')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={
              tab === 'whatsapp'
                ? { background: '#F5A800', color: '#111' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            WhatsApp Support
          </button>
        </div>

        {/* AI Chat */}
        {tab === 'ai' && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(245,168,0,0.1)', border: '1px solid rgba(245,168,0,0.2)' }}
                  >
                    <MessageCircle size={22} style={{ color: '#F5A800' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/75">Prime Support AI</p>
                    <p className="text-xs text-white/35 mt-0.5">Ask anything about the app</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      m.role === 'user'
                        ? { background: '#F5A800', color: '#111' }
                        : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="px-3.5 py-2.5 rounded-2xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-white/40 animate-pulse">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div
                className="flex items-end gap-2 rounded-2xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask a question…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: '#F5A800' }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* WhatsApp */}
        {tab === 'whatsapp' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)' }}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/80">Talk to our team directly</p>
              <p className="text-xs text-white/40 mt-1.5 leading-relaxed max-w-xs">
                For payment issues, account problems, or anything the AI couldn't resolve — we're on WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/237678683534"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl text-sm font-semibold text-center transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#25D366', color: '#fff', display: 'block' }}
            >
              Chat with us on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
