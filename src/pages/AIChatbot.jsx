import { useState, useRef, useEffect } from "react";
import { Send, Plus, MessageCircle, Mic, MicOff, PanelLeft, Zap, Paperclip, X } from "lucide-react";
import { chatWithAssistant, MODELS, DEFAULT_MODEL } from "../lib/gemini";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import UpgradeModal from "../components/UpgradeModal";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, getMediaType, readFileAsBase64 } from "../lib/fileUtils";

export default function AIChatbot() {
  const { t, chatSessions, createChatSession, updateChatSession, dataLoading, chatRemaining, incrementChat, trialExpired, fileUploadsRemaining, incrementFileUpload, trialActive, planActive } = useApp();
  const { profile } = useAuth();
  const canUploadFiles = trialActive || planActive;
  const username = profile?.username || profile?.full_name || null;
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { setFileError("File exceeds 5 MB limit."); return; }
    setFileError("");
    const base64 = await readFileAsBase64(file);
    setAttachedFile({ file, base64, mediaType: getMediaType(file.name) });
  };

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
    const fileToSend = attachedFile;
    if (!msg && !fileToSend) return;
    if (chatRemaining <= 0) return;

    setInput("");
    setAttachedFile(null);
    setFileError("");
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

    if (fileToSend && canUploadFiles && fileUploadsRemaining > 0) incrementFileUpload();
    // Stored content: plain text for history (file data is not persisted)
    const storedContent = msg || `📎 ${fileToSend.file.name}`;
    const newMessages = [...currentMessages, { role: "user", content: storedContent }];
    const label = newMessages[0]?.content.slice(0, 28) || "New Chat";
    await updateChatSession(currentChatId, newMessages, label);
    setLoading(true);

    // API messages: history (text) + current message (with file block if present)
    const apiMessages = [
      ...currentMessages,
      { role: "user", content: msg || "" },
    ];
    const fileArg = fileToSend
      ? { base64: fileToSend.base64, mediaType: fileToSend.mediaType, filename: fileToSend.file.name }
      : null;

    try {
      const reply = await chatWithAssistant(apiMessages, model, username, fileArg);
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
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
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

        {chatRemaining === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="glass rounded-2xl p-8 max-w-sm w-full text-center" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <MessageCircle size={24} style={{ color: '#f87171' }} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{trialExpired ? 'Free Trial Ended' : 'Daily Limit Reached'}</h2>
              <p className="text-sm text-white/50 leading-relaxed">{trialExpired ? 'Your 7-day free trial has ended — upgrade to Pro or Basic to keep studying.' : "You've reached your daily limit — upgrade to Pro for more."}</p>
              <div className="mt-5 px-4 py-2 rounded-full text-xs font-semibold inline-block" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                {trialExpired ? '7-day free trial ended' : `${10} / ${10} messages used today`}
              </div>
              <button
                onClick={() => setShowUpgrade(true)}
                className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2"
              >
                <Zap size={15} /> Upgrade Plan
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{t.aiChatTitle || "StudyPal AI"}</h2>
                    <p className="text-sm text-white/40">{t.aiChatSubtitle || "Ask me anything about your studies"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => send(chip)}
                        className="px-4 py-2 rounded-full text-sm text-white/70 hover:text-white transition-all hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      m.role === "user"
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
                  <div className="px-4 py-3 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-white/40 animate-pulse">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {/* File chip */}
              {attachedFile && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl text-xs w-fit" style={{ background: 'rgba(245,168,0,0.08)', border: '1px solid rgba(245,168,0,0.25)' }}>
                  <Paperclip size={11} style={{ color: '#F5A800', flexShrink: 0 }} />
                  <span className="text-white/70 truncate max-w-[220px]">{attachedFile.file.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="flex-shrink-0 text-white/35 hover:text-white/70 transition-colors"><X size={11} /></button>
                </div>
              )}
              {fileError && <p className="text-xs mb-1.5 px-1" style={{ color: '#f87171' }}>{fileError}</p>}

              {!canUploadFiles && (
                <p className="text-xs mb-1.5 px-1 text-white/40">Upgrade to access file uploads</p>
              )}
              {canUploadFiles && fileUploadsRemaining === 0 && (
                <p className="text-xs mb-1.5 px-1 text-white/40">Daily file upload limit reached</p>
              )}
              <div className="flex items-end gap-2 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {canUploadFiles && fileUploadsRemaining > 0 ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: attachedFile ? '#F5A800' : 'rgba(255,255,255,0.35)' }}
                    title="Attach file"
                  >
                    <Paperclip size={18} />
                  </button>
                ) : (
                  <div className="p-1.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    <Paperclip size={18} />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileChange} className="hidden" />
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={t.chatPlaceholder || "Ask anything…"}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none"
                  style={{ maxHeight: '120px' }}
                />
                <button onClick={toggleVoice} className={`p-1.5 rounded-lg transition-colors ${listening ? "text-red-400" : "text-white/40 hover:text-white"}`}>
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  onClick={() => send()}
                  disabled={(!input.trim() && !attachedFile) || loading}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: '#F5A800' }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
