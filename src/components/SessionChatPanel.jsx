import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, User } from 'lucide-react';
import { chatWithAssistant } from '../lib/gemini';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getCharacter } from '../lib/gamification';

const BOT_AVATAR = '/gamification-assets/avatars/studypal-avatar.png';

function BotAvatar() {
  return (
    <img
      src={BOT_AVATAR}
      alt="StudyPal"
      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
      style={{ border: '1px solid rgba(245,168,0,0.35)' }}
    />
  );
}

function UserAvatar({ character }) {
  if (character) {
    return (
      <img
        src={character.icon}
        alt={character.name}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        style={{ border: '1px solid rgba(0,77,46,0.5)' }}
      />
    );
  }
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <User size={14} className="text-white/50" />
    </div>
  );
}

export default function SessionChatPanel() {
  const { sessionMessages, updateSessionMessages, chatRemaining, incrementChat, trialExpired } = useApp();
  const { profile } = useAuth();
  const username = profile?.username || profile?.full_name || null;
  const userCharacter = getCharacter(profile?.character_avatar);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages, loading]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || chatRemaining <= 0) return;
    setInput('');
    incrementChat();
    const newMessages = [...sessionMessages, { role: 'user', content: userMsg }];
    await updateSessionMessages(newMessages);
    setLoading(true);
    try {
      const reply = await chatWithAssistant(newMessages, undefined, username);
      await updateSessionMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      await updateSessionMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice input not supported. Try Chrome or Edge.');
    if (listening) { recognitionRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    recognitionRef.current = rec;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => setInput(Array.from(e.results).map((r) => r[0].transcript).join(''));
    rec.start();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {sessionMessages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-white/35 text-center">Ask anything about your session topic</p>
          </div>
        )}
        {sessionMessages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role !== 'user' && <BotAvatar />}
            <div
              className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
              style={m.role === 'user'
                ? { background: '#F5A800', color: '#111' }
                : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {m.content}
            </div>
            {m.role === 'user' && <UserAvatar character={userCharacter} />}
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <BotAvatar />
            <div className="px-3 py-2 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-white/40 animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {chatRemaining === 0 ? (
          <p className="text-xs text-center py-1" style={{ color: '#f87171' }}>
            {trialExpired ? 'Free trial ended — upgrade to continue' : 'Daily limit reached'}
          </p>
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
              placeholder="Ask anything about your session…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none"
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
  );
}
