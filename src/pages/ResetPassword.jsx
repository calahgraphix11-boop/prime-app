import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

const DARK = {
  bg: "#0a1a0e",
  cardBg: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(10,26,14,0.8))",
  cardBorder: "rgba(255,255,255,0.08)",
  logoBg: "rgba(255,255,255,0.08)",
  logoBorder: "rgba(255,255,255,0.12)",
  inputBg: "rgba(255,255,255,0.08)",
  inputBorder: "rgba(255,255,255,0.12)",
  inputText: "#ffffff",
  labelText: "rgba(255,255,255,0.6)",
  gold: "#D4900A",
};

const inputStyle = (borderColor = DARK.inputBorder) => ({
  display: "block",
  width: "100%",
  padding: "0.75rem 2.5rem 0.75rem 1rem",
  fontSize: "0.875rem",
  background: DARK.inputBg,
  border: `1px solid ${borderColor}`,
  borderRadius: 12,
  color: DARK.inputText,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // 'checking' | 'ready' | 'invalid'
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Primary path: tokens were stashed in sessionStorage by main.jsx interceptor
      const blob = sessionStorage.getItem("recovery_tokens");
      if (blob) {
        const params = new URLSearchParams(blob);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          if (!cancelled) setStatus("ready");
          return;
        }
      }

      // Fallback: wait for Supabase to emit PASSWORD_RECOVERY (standard flow)
      const timer = setTimeout(() => {
        if (!cancelled) setStatus((s) => (s === "checking" ? "invalid" : s));
      }, 5000);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          clearTimeout(timer);
          if (!cancelled) setStatus("ready");
        }
      });

      return () => {
        cancelled = true;
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    }

    const cleanup = init();
    return () => {
      cancelled = true;
      cleanup.then?.((fn) => fn?.());
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message || "Failed to update password. The link may have expired.");
    } else {
      sessionStorage.removeItem("recovery_tokens");
      navigate("/login?reset=success");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 1rem",
        background: DARK.bg,
      }}
    >
      <div style={{ width: "100%", maxWidth: 384 }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: DARK.logoBg,
              borderRadius: 20,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${DARK.logoBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/logo.png"
              alt="Prime logo"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: DARK.cardBg,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${DARK.cardBorder}`,
            borderRadius: 24,
            padding: "1.75rem",
          }}
        >
          {status === "checking" && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: "3px solid rgba(255,255,255,0.1)",
                  borderTopColor: DARK.gold,
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", margin: 0 }}>
                Verifying your link…
              </p>
            </div>
          )}

          {status === "invalid" && (
            <>
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  color: "#ffffff",
                  marginBottom: 8,
                  marginTop: 0,
                }}
              >
                Link expired
              </h2>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#fca5a5",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 8,
                  padding: "0.75rem 1rem",
                  marginBottom: 20,
                }}
              >
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: 999,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  background: DARK.gold,
                  color: "#000",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "opacity 0.15s, transform 0.1s ease-out",
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                Back to sign in
              </button>
            </>
          )}

          {status === "ready" && (
            <>
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  color: "#ffffff",
                  marginBottom: 8,
                  marginTop: 0,
                }}
              >
                Set new password
              </h2>
              <p style={{ fontSize: "0.875rem", color: DARK.labelText, marginTop: 0, marginBottom: 20 }}>
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: DARK.labelText }}>
                    New password
                  </label>
                  <div style={{ position: "relative", marginTop: 6 }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={inputStyle()}
                      onFocus={(e) => {
                        e.target.style.borderColor = DARK.gold;
                        e.target.style.boxShadow = `0 0 0 3px rgba(212,144,10,0.18)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = DARK.inputBorder;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: DARK.gold,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: DARK.labelText }}>
                    Confirm password
                  </label>
                  <div style={{ position: "relative", marginTop: 6 }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={inputStyle()}
                      onFocus={(e) => {
                        e.target.style.borderColor = DARK.gold;
                        e.target.style.boxShadow = `0 0 0 3px rgba(212,144,10,0.18)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = DARK.inputBorder;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: DARK.gold,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#fca5a5",
                      background: "rgba(239,68,68,0.18)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 8,
                      padding: "0.5rem 0.75rem",
                      margin: 0,
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: 999,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginTop: 4,
                    background: DARK.gold,
                    color: "#000",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.4 : 1,
                    transition: "opacity 0.15s, transform 0.1s ease-out",
                    fontFamily: "inherit",
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
