import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';
import { chatWithAssistant } from '../lib/gemini';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, chatRemaining, incrementChat, trialExpired } = useApp();
  const { profile } = useAuth();
  const username = profile?.username || profile?.full_name || null;
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || chatRemaining <= 0) return;
    setInput('');
    incrementChat();
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const reply = await chatWithAssistant(newMessages, undefined, username);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const chips = [t.suggestPhotosynthesis, t.suggestCalculus, t.suggestWWII, t.suggestPython];

  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice input is not supported in this browser. Try Chrome or Edge.");

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
      setInput(transcript);
    };
    rec.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-80 h-[480px] rounded-2xl flex flex-col overflow-hidden shadow-2xl" style={{ background: '#001f14', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-gray-900"
            style={{ background: '#F5A800', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.12)' }}>
                <span className="text-xs font-bold">✦</span>
              </div>
              <div>
                <div className="text-sm font-semibold">{t.studyAssistant}</div>
                <div className="text-xs opacity-60">{t.askAnything}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-black/10 rounded transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <p className="text-xs text-white/40">{t.askAnything || 'Ask me anything about your studies'}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => send(chip)}
                      className="px-3 py-1.5 rounded-full text-xs text-white/70 hover:text-white transition-all hover:bg-white/10"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === 'user'
                      ? { background: '#F5A800', color: '#111' }
                      : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl text-xs" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-white/40 animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {chatRemaining === 0 ? (
              <p className="text-xs text-center py-1" style={{ color: '#f87171' }}>{trialExpired ? 'Free trial ended — upgrade to continue' : 'Daily limit reached'}</p>
            ) : (
              <div
                className="flex items-end gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={t.chatPlaceholder || 'Ask anything…'}
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/30 resize-none outline-none"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={toggleVoice}
                  className={`p-1 rounded-lg transition-colors ${listening ? 'text-red-400' : 'text-white/40 hover:text-white'}`}
                >
                  {listening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="p-1 rounded-lg disabled:opacity-30"
                  style={{ color: '#F5A800' }}
                >
                  <Send size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full text-gray-900 shadow-lg flex items-center justify-center transition-transform hover:scale-110 font-bold"
        style={{ background: '#F5A800', boxShadow: '0 4px 20px rgba(245,168,0,0.4)' }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
