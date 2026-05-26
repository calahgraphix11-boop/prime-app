import { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronRight, Trophy, RotateCcw, Target, Paperclip, X, Zap, Clock } from "lucide-react";
import { examCoach } from "../lib/gemini";
import { useApp } from "../context/AppContext";
import UpgradeModal from "../components/UpgradeModal";
import { ACCEPTED_FILE_TYPES, extractTextFromFile } from "../lib/fileUtils";
import { supabase } from "../lib/supabase";

const SYSTEM_PROMPT =
  "You are an exam preparation assistant. Return ONLY a valid JSON array with no markdown or backticks. Each object must have: question (string), options (array of exactly 4 strings labeled A. B. C. D.), correct (string matching one of the options exactly), explanation (string, one sentence max).";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const QUESTION_COUNTS = [5, 10, 15];

function getBadge(pct) {
  if (pct >= 90) return { label: "Excellent", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" };
  if (pct >= 70) return { label: "Good", color: "#F5A800", bg: "rgba(245,168,0,0.12)", border: "rgba(245,168,0,0.3)" };
  return { label: "Keep Practicing", color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" };
}

export default function ExamPrep() {
  const { courses, examRemaining, incrementExam, fileUploadsRemaining, incrementFileUpload, trialActive, trialExpired, planActive } = useApp();

  const [phase, setPhase] = useState("setup");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [tab, setTab] = useState("generate");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef(null);
  const canUploadFiles = fileUploadsRemaining > 0;

  useEffect(() => {
    if (tab !== "history") return;
    setHistoryLoading(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setHistoryLoading(false); return; }
      supabase.from("exam_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => { setHistory(data || []); setHistoryLoading(false); });
    });
  }, [tab]);

  const loadHistoryItem = (item) => {
    setTopic(item.topic);
    setSubject(item.subject || "");
    setDifficulty(item.difficulty);
    setQuestions(item.questions);
    setCurrentIndex(0);
    setAnswers({});
    setTab("generate");
    setPhase("quiz");
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

  const generate = async () => {
    if (!topic.trim() || examRemaining <= 0) return;
    setLoading(true);
    setError("");
    const subjectLabel = subject === "__custom__" ? customSubject : subject;
    try {
      const raw = await examCoach({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: `Topic: ${topic}\nSubject: ${subjectLabel || "General"}\nDifficulty: ${difficulty}\nQuestion count: ${questionCount}`,
        referenceText: attachedFile?.referenceText,
      });
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Could not parse response. Please try again.');
      const parsed = JSON.parse(jsonMatch[0]);
      incrementExam();
      if (attachedFile && canUploadFiles && fileUploadsRemaining > 0) incrementFileUpload();
      const sliced = parsed.slice(0, questionCount);
      setQuestions(sliced);
      setCurrentIndex(0);
      setAnswers({});
      setPhase("quiz");
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) supabase.from("exam_history").insert({ user_id: user.id, topic, subject: subjectLabel || null, difficulty, questions: sliced });
      });
    } catch {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (option) => {
    if (answers[currentIndex] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase("results");
    }
  };

  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const wrongAnswers = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct);

  const resetToSetup = () => {
    setPhase("setup");
    setTopic("");
    setSubject("");
    setCustomSubject("");
    setDifficulty("Medium");
    setQuestionCount(10);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setError("");
  };

  const tryAgain = () => {
    setCurrentIndex(0);
    setAnswers({});
    setPhase("quiz");
  };

  // ── Setup ────────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="space-y-5 pt-2">
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        <div>
          <h1 className="text-2xl font-bold text-white">Exam Coach</h1>
          <p className="text-sm text-white/50 mt-0.5">Practice smarter, not harder</p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <button onClick={() => setTab("generate")} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === "generate" ? "bg-white/10 text-white" : "text-white/40"}`}>Generate</button>
          <button onClick={() => setTab("history")} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === "history" ? "bg-white/10 text-white" : "text-white/40"}`}><Clock size={13} />History</button>
        </div>

        {tab === "history" ? (
          <div className="glass rounded-2xl p-5">
            {historyLoading ? (
              <p className="text-sm text-white/40 text-center py-6">Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-6">No past sessions yet</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <button key={item.id} onClick={() => loadHistoryItem(item)} className="w-full text-left px-4 py-3 rounded-xl transition-all btn-ghost">
                    <div className="text-sm font-medium text-white truncate">{item.topic}</div>
                    <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
                      {item.subject && <><span>{item.subject}</span><span>·</span></>}
                      <span>{item.difficulty}</span>
                      <span>·</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : examRemaining === 0 ? (
          <div className="glass rounded-2xl p-6 text-center" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Sparkles size={20} style={{ color: '#f87171' }} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">{trialExpired ? 'Free Trial Ended' : 'Daily Limit Reached'}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{trialExpired ? 'Your 7-day free trial has ended — upgrade to keep practicing.' : "You've used all 5 Exam Coach sessions for today — upgrade for unlimited access."}</p>
            <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold inline-block" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {trialExpired ? '7-day free trial ended' : '5 / 5 sessions used today'}
            </div>
            <button onClick={() => setShowUpgrade(true)} className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2">
              <Zap size={15} /> Upgrade Plan
            </button>
          </div>
        ) : (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-white/75 block mb-1.5">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, World War II, Calculus…"
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          {/* File attachment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-white/75">Reference Material</label>
              {canUploadFiles && fileUploadsRemaining > 0 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'rgba(0,77,46,0.3)', border: '1px solid rgba(0,77,46,0.5)', color: '#34d399' }}
                >
                  <Paperclip size={12} /> Attach file
                </button>
              ) : null}
              <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileChange} className="hidden" />
            </div>
            {!canUploadFiles ? (
              <p className="text-xs text-white/40">Upgrade to access file uploads</p>
            ) : fileUploadsRemaining === 0 ? (
              <p className="text-xs text-white/40">Daily file upload limit reached</p>
            ) : attachedFile ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(245,168,0,0.08)', border: '1px solid rgba(245,168,0,0.25)' }}>
                <Paperclip size={12} style={{ color: '#F5A800', flexShrink: 0 }} />
                <span className="text-white/70 truncate flex-1">{attachedFile.file.name}</span>
                <button onClick={() => setAttachedFile(null)} className="flex-shrink-0 text-white/35 hover:text-white/70 transition-colors"><X size={12} /></button>
              </div>
            ) : (
              <p className="text-xs text-white/30">Optional — attach notes or a document to generate topic-specific questions</p>
            )}
            {fileError && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{fileError}</p>}
            <p className="text-xs text-white/30 mt-1">PDF, DOCX or TXT — max 5MB</p>
          </div>

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

          <div>
            <label className="text-sm font-medium text-white/75 block mb-2">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${difficulty === d ? "btn-gold" : "btn-ghost"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white/75 block mb-2">Number of Questions</label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${questionCount === n ? "btn-gold" : "btn-ghost"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!topic.trim() || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin inline-block" /> Generating…</>
            ) : (
              <><Sparkles size={16} /> Generate Questions</>
            )}
          </button>
          {examRemaining < 999 && (
            <p className="text-xs text-center text-white/35">{examRemaining} of 5 sessions remaining today</p>
          )}
        </div>
        )}

        {error && <p className="text-sm px-1" style={{ color: "#f87171" }}>{error}</p>}
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  if (phase === "quiz") {
    const q = questions[currentIndex];
    const selected = answers[currentIndex];
    const answered = selected !== undefined;

    return (
      <div className="space-y-5 pt-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Exam Coach</h1>
            <p className="text-sm text-white/50 mt-0.5">Practice smarter, not harder</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-white/40 mb-0.5">Question</div>
            <div className="text-sm font-semibold text-white">{currentIndex + 1} / {questions.length}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%`, background: "#F5A800" }}
          />
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <p className="text-base font-medium text-white leading-relaxed">{q.question}</p>

          <div className="space-y-2">
            {q.options.map((opt) => {
              let cls = "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all btn-ghost";
              let style = {};
              if (answered) {
                if (opt === q.correct) {
                  cls = "w-full text-left px-4 py-3 rounded-xl text-sm font-medium";
                  style = { background: "rgba(52,211,153,0.18)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399" };
                } else if (opt === selected) {
                  cls = "w-full text-left px-4 py-3 rounded-xl text-sm font-medium";
                  style = { background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" };
                } else {
                  cls = "w-full text-left px-4 py-3 rounded-xl text-sm font-medium";
                  style = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" };
                }
              }
              return (
                <button key={opt} onClick={() => selectAnswer(opt)} disabled={answered} className={cls} style={style}>
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="font-semibold text-white/60">Explanation: </span>
              <span className="text-white/75">{q.explanation}</span>
            </div>
          )}

          {answered && (
            <button
              onClick={next}
              className="w-full py-3 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2"
            >
              {currentIndex < questions.length - 1 ? (
                <>Next Question <ChevronRight size={16} /></>
              ) : (
                <>See Results <Trophy size={16} /></>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  const badge = getBadge(pct);

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-white">Exam Coach</h1>
        <p className="text-sm text-white/50 mt-0.5">Practice smarter, not harder</p>
      </div>

      <div className="glass rounded-2xl p-6 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: badge.bg, border: `1px solid ${badge.border}` }}>
          <Trophy size={28} style={{ color: badge.color }} />
        </div>
        <div>
          <div className="text-4xl font-bold text-white">{pct}%</div>
          <div className="text-sm text-white/50 mt-0.5">{score} of {questions.length} correct</div>
        </div>
        <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>
          {badge.label}
        </div>
      </div>

      {wrongAnswers.length > 0 && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Review Missed Questions</h3>
          {wrongAnswers.map((q, i) => (
            <div key={i} className="space-y-1.5 pb-4" style={{ borderBottom: i < wrongAnswers.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <p className="text-sm text-white/80">{q.question}</p>
              <p className="text-xs font-medium" style={{ color: "#34d399" }}>Correct: {q.correct}</p>
              <p className="text-xs text-white/45">{q.explanation}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={tryAgain}
          className="flex-1 py-3 rounded-xl text-sm font-semibold btn-ghost flex items-center justify-center gap-2"
        >
          <RotateCcw size={15} /> Try Again
        </button>
        <button
          onClick={resetToSetup}
          className="flex-1 py-3 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2"
        >
          <Target size={15} /> New Topic
        </button>
      </div>
    </div>
  );
}
