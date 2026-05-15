import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function VerifyEmail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "";
  const firstName = state?.firstName || "there";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  if (!email) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "signup",
    });
    setLoading(false);
    if (err) {
      setError("Invalid code — please try again.");
    } else {
      setWelcome(true);
      requestAnimationFrame(() => setWelcomeVisible(true));
      setTimeout(() => {
        setWelcomeVisible(false);
        setTimeout(() => navigate("/"), 500);
      }, 3000);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    await supabase.auth.resend({ type: "signup", email });
    setResendLoading(false);
    setResendSent(true);
    setTimeout(() => setResendSent(false), 5000);
  };

  return (
    <div className="app-bg min-h-screen w-full flex flex-col items-center justify-center px-4">
      {/* Welcome toast */}
      {welcome && (
        <div
          className="fixed top-4 left-1/2 z-50 max-w-sm w-full px-4"
          style={{ transform: "translateX(-50%)", transition: "opacity 500ms ease", opacity: welcomeVisible ? 1 : 0 }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(0,18,8,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(245,168,0,0.35)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <span className="text-lg">🎉</span>
            <p className="text-sm text-white/90 font-medium">Welcome to Prime, {firstName}!</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-2 flex items-center justify-center"
            style={{ width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: 24, backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <img src="/logo.png" alt="prime logo" style={{ width: 200, height: 200, objectFit: "contain", borderRadius: 24 }} />
          </div>
        </div>

        <div className="glass-elevated rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">✉️</div>
            <h2 className="text-lg font-semibold text-white mb-1">Check your email</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="text-white/80 font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/75">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="000000"
                required
                autoFocus
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl glass-input text-sm text-center tracking-[0.5em] font-mono"
              />
            </div>
            {error && (
              <p className="text-sm text-red-300 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.3)" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-2.5 rounded-xl text-sm btn-gold disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>
          </form>

          <p className="text-center text-sm text-white/45 mt-4">
            Didn't get it?{" "}
            <button
              onClick={handleResend}
              disabled={resendLoading || resendSent}
              className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
            >
              {resendSent ? "Sent!" : resendLoading ? "Sending…" : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
