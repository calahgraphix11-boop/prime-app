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
  const { t, chatRemaining, incrementChat } = useApp();
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
        <div className="mb-4 w-80 h-[480px] glass-elevated rounded-2xl flex flex-col overflow-hidden shadow-2xl">
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

          <div className="flex-1 flex items-center justify-center p-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                <MessageCircle size={20} style={{ color: '#34d399' }} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">AI Features Coming Soon</p>
              <p className="text-xs text-white/45 leading-relaxed">StudyPal will be live shortly.<br />Stay tuned!</p>
              <div className="mt-4 px-3 py-1 rounded-full text-xs font-semibold inline-block" style={{ background: 'rgba(245,168,0,0.12)', border: '1px solid rgba(245,168,0,0.3)', color: '#F5A800' }}>
                Coming Soon
              </div>
            </div>
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
