import { useState, useRef, useEffect } from "react";
import { Send, Plus, MessageCircle, Mic, MicOff, PanelLeft } from "lucide-react";
import { chatWithAssistant, MODELS, DEFAULT_MODEL } from "../lib/gemini";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function AIChatbot() {
  const { t, chatSessions, createChatSession, updateChatSession, dataLoading, chatRemaining, incrementChat } = useApp();
  const { profile } = useAuth();
  const username = profile?.username || profile?.full_name || null;
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (chatSessions.length > 0 && activeChatId === null) {
      setActiveChatId(chatSessions[0].id);
    }
  }, [chatSessions, activeChatId]);

  const activeChat = chatSessions.find((c) => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const newChat = async () => {
    const chat = await createChatSession();
    if (chat) setActiveChatId(chat.id);
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    if (chatRemaining <= 0) return;
    setInput("");
    incrementChat();

    let currentChatId = activeChatId;
    let currentMessages = messages;

    if (!currentChatId) {
      const chat = await createChatSession();
      if (!chat) return;
      currentChatId = chat.id;
      currentMessages = [];
      setActiveChatId(chat.id);
    }

    const newMessages = [...currentMessages, { role: "user", content: msg }];
    const label = newMessages[0]?.content.slice(0, 28) || "New Chat";
    await updateChatSession(currentChatId, newMessages, label);
    setLoading(true);

    try {
      const reply = await chatWithAssistant(newMessages, model, username);
      await updateChatSession(
        currentChatId,
        [...newMessages, { role: "assistant", content: reply }],
        label
      );
    } catch {
      await updateChatSession(
        currentChatId,
        [...newMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }],
        label
      );
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
    <div className="-mx-4 -mt-6 flex h-[calc(100vh-5rem)] overflow-hidden">
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Chat list sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto z-40 md:z-auto w-64 flex flex-col flex-shrink-0 transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ background: 'rgba(0, 20, 10, 0.75)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="p-3 space-y-3">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium btn-ghost"
          >
            <Plus size={16} />{t.newChat}
          </button>
          {/* Model selector */}
          <div>
            <p className="text-xs text-white/35 font-semibold uppercase tracking-wider mb-1.5 px-1">Model</p>
            <div className="flex flex-col gap-1">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${model === m.id ? "text-gray-900" : "text-white/55 hover:text-white hover:bg-white/8"}`}
                  style={model === m.id ? { background: '#F5A800' } : {}}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {dataLoading && (
            <p className="text-xs text-white/30 text-center py-4">Loading…</p>
          )}
          {!dataLoading && chatSessions.length === 0 && (
            <p className="text-xs text-white/30 text-center py-4">{t.noChats}</p>
          )}
          {chatSessions.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveChatId(c.id); setShowSidebar(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all truncate ${c.id === activeChatId ? "font-medium text-gray-900" : "text-white/55 hover:text-white hover:bg-white/8"}`}
              style={c.id === activeChatId ? { background: '#F5A800' } : {}}
            >
              {c.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-2 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-2 text-sm text-white/60 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <PanelLeft size={16} /> Chats
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="glass rounded-2xl p-8 max-w-sm w-full text-center" style={{ border: '1px solid rgba(245,168,0,0.25)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
              <MessageCircle size={24} style={{ color: '#34d399' }} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">AI Features Coming Soon</h2>
            <p className="text-sm text-white/50 leading-relaxed">StudyPal is almost ready. Stay tuned — AI-powered chat will be live shortly!</p>
            <div className="mt-5 px-4 py-2 rounded-full text-xs font-semibold inline-block" style={{ background: 'rgba(245,168,0,0.12)', border: '1px solid rgba(245,168,0,0.3)', color: '#F5A800' }}>
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
