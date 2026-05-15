import { useState } from "react";
import { Sparkles, List, BookOpen, HelpCircle } from "lucide-react";
import { kimiGenerate } from "../lib/kimi";
import { useApp } from "../context/AppContext";

const SYSTEM_PROMPT =
  "You are an expert study assistant. When given lecture notes or study material, extract and return ONLY a valid JSON object with no markdown or backticks with three keys: keyPoints (array of strings), keyDefinitions (array of objects with term and definition), examQuestions (array of strings). Be concise and academically focused.";

export default function NoteSummarizer() {
  const { courses } = useApp();

  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSummarize = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    const subjectLabel = subject === "__custom__" ? customSubject : subject;
    try {
      const raw = await kimiGenerate({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: `Subject: ${subjectLabel || "General"}\n\nNotes:\n${notes}`,
      });
      setResult(JSON.parse(raw));
    } catch {
      setError("Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-white">Note Summarizer</h1>
        <p className="text-sm text-white/50 mt-0.5">Turn your lecture notes into study gold</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        {/* Subject selector */}
        <div>
          <label className="text-sm font-medium text-white/75 block mb-1.5">Subject</label>
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

        {/* Notes textarea */}
        <div>
          <label className="text-sm font-medium text-white/75 block mb-1.5">Lecture Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your notes here…"
            rows={8}
            className="w-full px-3 py-2.5 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        <button
          onClick={handleSummarize}
          disabled={!notes.trim() || loading}
          className="w-full py-3 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin inline-block" /> Summarizing…</>
          ) : (
            <><Sparkles size={16} /> Summarize Notes</>
          )}
        </button>
      </div>

      {error && <p className="text-sm px-1" style={{ color: "#f87171" }}>{error}</p>}

      {result && (
        <div className="space-y-4">
          {/* Key Points */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)" }}>
                <List size={15} style={{ color: "#34d399" }} />
              </div>
              <h3 className="text-sm font-semibold text-white">Key Points</h3>
            </div>
            <ul className="space-y-2">
              {result.keyPoints?.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/75">
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
              <h3 className="text-sm font-semibold text-white">Key Definitions</h3>
            </div>
            <div className="space-y-3">
              {result.keyDefinitions?.map((def, i) => (
                <div key={i}>
                  <span className="text-sm font-semibold" style={{ color: "#F5A800" }}>{def.term}</span>
                  <span className="text-sm text-white/60">: {def.definition}</span>
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
              <h3 className="text-sm font-semibold text-white">Likely Exam Questions</h3>
            </div>
            <ol className="space-y-2">
              {result.examQuestions?.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
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
