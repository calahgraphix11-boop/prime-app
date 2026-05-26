// SQL — run once in Supabase SQL Editor to add title column:
// ALTER TABLE summary_history ADD COLUMN IF NOT EXISTS title text;

import { useState, useRef, useEffect } from "react";
import { Sparkles, List, BookOpen, HelpCircle, Paperclip, X, Zap, Clock, Pencil, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { generateWithFile } from "../lib/gemini";
import { useApp } from "../context/AppContext";
import UpgradeModal from "../components/UpgradeModal";
import { ACCEPTED_FILE_TYPES, extractTextFromFile } from "../lib/fileUtils";
import { supabase } from "../lib/supabase";

const SYSTEM_PROMPT =
  "You are an expert study assistant. The user may provide lecture notes as text or as an attached file, and may also provide optional instructions for what they want. If no instructions are given, return a full summary as a JSON object with: keyPoints (array of strings), keyDefinitions (array of objects with term and definition), examQuestions (array of strings). If the user gives specific instructions, follow them and return the result in the same JSON format. Return ONLY valid JSON with no markdown or backticks.";

const SESSION_NAMES = [
  "Study Sprint", "Quick Dive", "Brain Dump", "Note Crunch", "Focus Fire",
  "Deep Read", "Swift Scan", "Mind Map", "Key Takeaway", "Flash Notes",
];

function randomTitle() {
  const name = SESSION_NAMES[Math.floor(Math.random() * SESSION_NAMES.length)];
  const num = String(Math.floor(Math.random() * 90) + 10);
  return `${name} ${num}`;
}

export default function NoteSummarizer() {
  const { courses, summaryRemaining, incrementSummary, trialExpired, fileUploadsRemaining, incrementFileUpload, trialActive, planActive, userPlan } = useApp();
  const canUploadFiles = userPlan === 'basic' || userPlan === 'pro';

  const [instructions, setInstructions] = useState("");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [tab, setTab] = useState("generate");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (tab !== "history") return;
    setExpandedId(null);
    setResult(null);
    setHistoryLoading(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setHistoryLoading(false); return; }
      supabase.from("summary_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => { setHistory(data || []); setHistoryLoading(false); });
    });
  }, [tab]);

  const loadHistoryItem = (item) => {
    try { setResult(JSON.parse(item.summary)); } catch { setResult(null); }
    setTab("generate");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFileError("File too large. Please attach a file under 5MB."); if (fileInputRef.current) fileInputRef.current.value = ""; return; }
    setFileError("");
    const referenceText = await extractTextFromFile(file);
    setAttachedFile({ file, referenceText });
  };

  const handleSummarize = async () => {
    if ((!instructions.trim() && !attachedFile) || summaryRemaining <= 0) return;
    incrementSummary();
    if (attachedFile && canUploadFiles && fileUploadsRemaining > 0) incrementFileUpload();
    setLoading(true);
    setError("");
    setResult(null);
    const subjectLabel = subject === "__custom__" ? customSubject : subject;
    try {
      const raw = await generateWithFile({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: `Subject: ${subjectLabel || "General"}${instructions.trim() ? `\n\nInstructions: ${instructions}` : ''}`,
        referenceText: attachedFile?.referenceText,
      });
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse response.');
      const parsed = JSON.parse(jsonMatch[0]);
      setResult(parsed);
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const payload = {
            user_id: user.id,
            subject: subjectLabel || null,
            instructions: instructions.trim() || null,
            summary: JSON.stringify(parsed),
            title: randomTitle(),
          };
          console.log('[summary_history] saving:', payload);
          supabase.from("summary_history").insert(payload).then(({ error }) => {
            if (error) console.error('[summary_history] save error:', error);
          });
        }
      });
    } catch (error) {
      console.error('[summary_history] save error:', error);
      setError("Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const startEdit = (item, e) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditingTitle(item.title || "");
  };

  const saveEdit = async (id) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) { setEditingId(null); return; }
    await supabase.from("summary_history").update({ title: trimmed }).eq("id", id);
    setHistory((prev) => prev.map((h) => h.id === id ? { ...h, title: trimmed } : h));
    setEditingId(null);
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") saveEdit(id);
    if (e.key === "Escape") setEditingId(null);
  };

  const deleteItem = async (id, e) => {
    e.stopPropagation();
    await supabase.from("summary_history").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const renderSummary = (item) => {
    let parsed;
    try { parsed = JSON.parse(item.summary); } catch { return <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">Could not load summary.</p>; }
    return (
      <div className="mt-3 space-y-3 text-xs">
        {parsed.keyPoints?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Key Points</p>
            <ul className="space-y-1">
              {parsed.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300">
                  <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#34d399" }} />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        )}
        {parsed.keyDefinitions?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Definitions</p>
            <div className="space-y-1">
              {parsed.keyDefinitions.map((def, i) => (
                <div key={i}>
                  <span className="font-semibold" style={{ color: "#F5A800" }}>{def.term}</span>
                  <span className="text-gray-700 dark:text-gray-300">: {def.definition}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {parsed.examQuestions?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Exam Questions</p>
            <ol className="space-y-1">
              {parsed.examQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300">
                  <span className="flex-shrink-0 font-semibold" style={{ color: "#a78bfa" }}>{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        )}
        <button
          onClick={() => loadHistoryItem(item)}
          className="mt-1 text-xs font-medium px-3 py-1.5 rounded-lg btn-ghost w-full"
        >
          Load into view
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5 pt-2">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Note Summarizer</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">Turn your lecture notes into study gold</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <button onClick={() => setTab("generate")} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === "generate" ? "bg-white/10 text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>Summarize</button>
        <button onClick={() => setTab("history")} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === "history" ? "bg-white/10 text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}><Clock size={13} />History</button>
      </div>

      {tab === "history" && (
        <div className="space-y-2">
          {historyLoading ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center py-6">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center py-6">No past summaries yet</p>
          ) : history.map((item) => {
            const isExpanded = expandedId === item.id;
            const isEditing = editingId === item.id;
            const displayTitle = item.title || item.subject || `Summary · ${new Date(item.created_at).toLocaleDateString()}`;
            return (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{ border: '1px solid rgba(245,168,0,0.35)', background: isExpanded ? 'rgba(245,168,0,0.06)' : 'rgba(245,168,0,0.03)' }}
              >
                {/* Pill header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
                  onClick={() => !isEditing && toggleExpand(item.id)}
                >
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                          className="flex-1 text-sm font-medium bg-transparent border-b text-gray-900 dark:text-white outline-none"
                          style={{ borderColor: 'rgba(245,168,0,0.6)' }}
                        />
                        <button onClick={() => saveEdit(item.id)} className="flex-shrink-0 p-0.5 rounded" style={{ color: '#F5A800' }}>
                          <Check size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold truncate text-gray-900 dark:text-white">{displayTitle}</span>
                        <button
                          onClick={(e) => startEdit(item, e)}
                          className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity"
                          style={{ color: '#F5A800' }}
                        >
                          <Pencil size={11} />
                        </button>
                      </div>
                    )}
                    <div className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                      {item.subject && <span className="mr-1">{item.subject} ·</span>}
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => deleteItem(item.id, e)}
                      className="opacity-30 hover:opacity-70 transition-opacity"
                      style={{ color: '#f87171' }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="text-gray-700 dark:text-gray-300 opacity-50">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* Expanded summary */}
                {isExpanded && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(245,168,0,0.2)' }}>
                    {renderSummary(item)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "generate" && <div className="glass rounded-2xl p-5 space-y-4">
        {/* Subject selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
          >
            <option value="">Select a subject…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
            <option value="__custom__">Other (type below)</option>
          </select>
          {subject === "__custom__" && (
            <input
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Enter subject…"
              className="mt-2 w-full px-3 py-2.5 rounded-xl glass-input text-sm"
            />
          )}
        </div>

        {/* Instructions textarea */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Optional — describe what you want (e.g. 'focus on key definitions', 'generate 10 exam questions', 'summarize chapter 3 only'). Leave blank to get a full summary."
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {/* File attachment */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attach a file</span>
            {canUploadFiles && fileUploadsRemaining > 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(0,77,46,0.3)', border: '1px solid rgba(0,77,46,0.5)', color: '#34d399' }}
              >
                <Paperclip size={12} /> Choose file
              </button>
            )}
            <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileChange} className="hidden" />
          </div>
          {!canUploadFiles ? (
            <p className="text-xs text-gray-700 dark:text-gray-300">Upgrade to access file uploads</p>
          ) : fileUploadsRemaining === 0 ? (
            <p className="text-xs text-gray-700 dark:text-gray-300">Daily file upload limit reached</p>
          ) : attachedFile ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(245,168,0,0.08)', border: '1px solid rgba(245,168,0,0.25)' }}>
              <Paperclip size={12} style={{ color: '#F5A800', flexShrink: 0 }} />
              <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{attachedFile.file.name}</span>
              <button onClick={() => setAttachedFile(null)} className="flex-shrink-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={12} /></button>
            </div>
          ) : (
            <p className="text-xs text-gray-700 dark:text-gray-300">PDF, image, or text file — used alongside or instead of typed notes</p>
          )}
          {fileError && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{fileError}</p>}
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">PDF, DOCX or TXT — max 5MB</p>
        </div>

        {summaryRemaining === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Sparkles size={20} style={{ color: '#f87171' }} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">{trialExpired ? 'Free Trial Ended' : 'Daily Limit Reached'}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{trialExpired ? 'Your 7-day free trial has ended — upgrade to Pro or Basic to keep summarizing notes.' : "You've used all 5 summaries for today — upgrade for unlimited access."}</p>
            <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold inline-block" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {trialExpired ? '7-day free trial ended' : '5 / 5 summaries used today'}
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2"
            >
              <Zap size={15} /> Upgrade Plan
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleSummarize}
              disabled={(!instructions.trim() && !attachedFile) || loading}
              className="w-full py-3 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin inline-block" /> Summarizing…</>
              ) : (
                <><Sparkles size={16} /> Summarize Notes</>
              )}
            </button>
            {summaryRemaining < 999 && (
              <p className="text-xs text-center text-gray-700 dark:text-gray-300">{summaryRemaining} of 5 summaries remaining today</p>
            )}
          </>
        )}
      </div>}

      {error && <p className="text-sm px-1" style={{ color: "#f87171" }}>{error}</p>}

      {result && (
        <div className="space-y-4">
          {/* Key Points */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)" }}>
                <List size={15} style={{ color: "#34d399" }} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Key Points</h3>
            </div>
            <ul className="space-y-2">
              {result.keyPoints?.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#34d399" }} />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Definitions */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,168,0,0.15)", border: "1px solid rgba(245,168,0,0.25)" }}>
                <BookOpen size={15} style={{ color: "#F5A800" }} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Key Definitions</h3>
            </div>
            <div className="space-y-3">
              {result.keyDefinitions?.map((def, i) => (
                <div key={i}>
                  <span className="text-sm font-semibold" style={{ color: "#F5A800" }}>{def.term}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">: {def.definition}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Questions */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                <HelpCircle size={15} style={{ color: "#a78bfa" }} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Likely Exam Questions</h3>
            </div>
            <ol className="space-y-2">
              {result.examQuestions?.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
