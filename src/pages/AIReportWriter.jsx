import { useState } from "react";
import { Sparkles, Copy, Check, FileText, ChevronDown, Zap } from "lucide-react";
import { rewriteReport, MODELS, DEFAULT_REPORT_MODEL } from "../lib/gemini";
import { useApp } from "../context/AppContext";
import UpgradeModal from "../components/UpgradeModal";

const TONES = [
  { id: "formal", label: "Formal", desc: "Professional and structured" },
  { id: "academic", label: "Academic", desc: "Scholarly and research-oriented" },
  { id: "casual", label: "Casual", desc: "Conversational and approachable" },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AIReportWriter() {
  const { t, addReport, reports, rewriteRemaining, incrementRewrite, trialExpired } = useApp();
  const [reportTitle, setReportTitle] = useState("");
  const [tone, setTone] = useState("academic");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [model, setModel] = useState(DEFAULT_REPORT_MODEL);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleRewrite = async () => {
    if (!content.trim() || rewriteRemaining <= 0) return;
    incrementRewrite();
    setLoading(true);
    setError("");
    setResult("");
    try {
      const out = await rewriteReport(reportTitle || "Untitled Report", tone, content, model);
      setResult(out);
      addReport({ title: reportTitle || "Untitled Report", tone, preview: out.slice(0, 100), content: out });
    } catch (e) {
      setError(e.message || "Failed to generate.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 pt-2">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <div>
        <h1 className="text-2xl font-bold text-white">{t.aiReportWriter}</h1>
        <p className="text-sm text-white/50 mt-0.5">{t.reportSubtitle}</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-5">
        <div>
          <label className="text-sm font-medium text-white/75">{t.reportTitle}</label>
          <input
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder={t.enterTitle}
            className="mt-1.5 w-full px-3 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/75 block mb-2">{t.selectTone}</label>
          <div className="grid grid-cols-3 gap-2">
            {TONES.map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => setTone(id)}
                className={`p-3 rounded-xl text-left transition-all ${tone === id ? "btn-gold" : "btn-ghost"}`}
              >
                <div className="text-sm font-medium">{label}</div>
                <div className={`text-xs mt-0.5 ${tone === id ? "text-gray-700/70" : "text-white/35"}`}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white/75">{t.originalContent}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.pasteContent}
            rows={6}
            className="mt-1.5 w-full px-3 py-2.5 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {/* Model selector */}
        <div>
          <label className="text-sm font-medium text-white/75 block mb-2">Model</label>
          <div className="flex gap-2 flex-wrap">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${model === m.id ? "btn-gold" : "btn-ghost"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {rewriteRemaining === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Sparkles size={20} style={{ color: '#f87171' }} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">{trialExpired ? 'Free Trial Ended' : 'Daily Limit Reached'}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{trialExpired ? 'Your 7-day free trial has ended — upgrade to Pro or Basic to keep rewriting reports.' : "You've reached your daily limit — upgrade to Pro for more."}</p>
            <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold inline-block" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {trialExpired ? '7-day free trial ended' : `${5} / ${5} rewrites used today`}
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2"
            >
              <Zap size={15} /> Upgrade Plan
            </button>
          </div>
        ) : (
          <button
            onClick={handleRewrite}
            disabled={!content.trim() || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin inline-block" />
                Rewriting…
              </>
            ) : (
              <><Sparkles size={16} /> Rewrite with AI</>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm px-1" style={{ color: '#f87171' }}>{error}</p>
      )}

      {result && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Result</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-ghost"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div
            className="p-4 rounded-xl text-sm text-white/80 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {result}
          </div>
        </div>
      )}

      {/* Report History */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">{t.reportHistory}</h2>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/30">
            <FileText size={40} className="mb-2 opacity-30" />
            <p className="text-sm">{t.noReports}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-white/5"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.18)' }}>
                    <FileText size={16} style={{ color: '#34d399' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{r.title}</div>
                    <div className="text-xs text-white/40 mt-0.5 capitalize">{r.tone} · {formatDate(r.date)}</div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-white/30 flex-shrink-0 transition-transform ${expandedId === r.id ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedId === r.id && (
                  <div className="px-4 pb-4">
                    <div className="p-3 rounded-xl text-sm text-white/70 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {r.content || r.preview || "No content saved."}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
