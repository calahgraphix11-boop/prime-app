import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
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
  inputPlaceholder: "rgba(255,255,255,0.35)",
  labelText: "rgba(255,255,255,0.6)",
  divider: "rgba(255,255,255,0.08)",
  orText: "rgba(255,255,255,0.25)",
  mutedText: "#8ab08a",
  gold: "#D4900A",
  googleBg: "rgba(255,255,255,0.06)",
  googleBorder: "rgba(255,255,255,0.10)",
};

export default function Login() {
  const { t } = useApp();
  const { signIn, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const plan = new URLSearchParams(location.search).get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetSuccess = new URLSearchParams(location.search).get("reset") === "success";

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: "https://primestudyapp.com/#/reset-password",
    });
    setForgotLoading(false);
    if (err) {
      setForgotError(err.message || t.somethingWentWrongTryAgain);
    } else {
      setForgotSent(true);
    }
  };

  const handleGoogle = async () => {
    if (plan) sessionStorage.setItem("pendingUpgradePlan", plan);
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err.message || t.googleSignInFailed); setGoogleLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message || t.invalidCredentials);
    } else {
      navigate(plan ? `/upgrade?plan=${plan}` : "/");
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
          {resetSuccess && (
            <div
              style={{
                marginBottom: 16,
                fontSize: "0.875rem",
                color: "#6ee7b7",
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: 8,
                padding: "0.5rem 0.75rem",
              }}
            >
              {t.passwordUpdatedMessage}
            </div>
          )}

          {forgotMode ? (
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
                {t.resetPasswordTitle}
              </h2>
              <p style={{ fontSize: "0.875rem", color: DARK.labelText, marginTop: 0, marginBottom: 20 }}>
                {t.resetPasswordSubtitle}
              </p>

              {forgotSent ? (
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#6ee7b7",
                    background: "rgba(52,211,153,0.12)",
                    border: "1px solid rgba(52,211,153,0.25)",
                    borderRadius: 8,
                    padding: "0.75rem 1rem",
                    marginBottom: 16,
                  }}
                >
                  {t.checkEmailForResetLink}
                </div>
              ) : (
                <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: "0.875rem", fontWeight: 500, color: DARK.labelText }}>
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: 6,
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        background: DARK.inputBg,
                        border: `1px solid ${DARK.inputBorder}`,
                        borderRadius: 12,
                        color: DARK.inputText,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = DARK.gold;
                        e.target.style.boxShadow = `0 0 0 3px rgba(212,144,10,0.18)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = DARK.inputBorder;
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {forgotError && (
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
                      {forgotError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
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
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      opacity: forgotLoading ? 0.4 : 1,
                      transition: "opacity 0.15s, transform 0.1s ease-out",
                      fontFamily: "inherit",
                    }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    {forgotLoading ? t.sendingEllipsis : t.sendResetLink}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setForgotMode(false); setForgotSent(false); setForgotError(""); }}
                style={{
                  marginTop: 16,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: DARK.gold,
                  fontFamily: "inherit",
                  padding: 0,
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {t.backToSignIn}
              </button>
            </>
          ) : (
          <>
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "1.5rem",
              color: "#ffffff",
              marginBottom: 24,
              marginTop: 0,
            }}
          >
            {t.welcomeBack}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: DARK.labelText }}>
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 6,
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  background: DARK.inputBg,
                  border: `1px solid ${DARK.inputBorder}`,
                  borderRadius: 12,
                  color: DARK.inputText,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = DARK.gold;
                  e.target.style.boxShadow = `0 0 0 3px rgba(212,144,10,0.18)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = DARK.inputBorder;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: DARK.labelText }}>
                {t.password}
              </label>
              <div style={{ position: "relative", marginTop: 6 }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 1rem",
                    fontSize: "0.875rem",
                    background: DARK.inputBg,
                    border: `1px solid ${DARK.inputBorder}`,
                    borderRadius: 12,
                    color: DARK.inputText,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
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

            <div style={{ textAlign: "right", marginTop: -8 }}>
              <button
                type="button"
                onClick={() => { setForgotMode(true); setError(""); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  color: DARK.gold,
                  fontFamily: "inherit",
                  padding: 0,
                }}
              >
                {t.forgotPassword}
              </button>
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
                marginTop: 8,
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
              {loading ? "..." : t.signIn}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: DARK.divider }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 500, color: DARK.orText }}>{t.orDivider}</span>
            <div style={{ flex: 1, height: 1, background: DARK.divider }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "0.75rem",
              borderRadius: 999,
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#ffffff",
              background: DARK.googleBg,
              border: `1px solid ${DARK.googleBorder}`,
              cursor: googleLoading ? "not-allowed" : "pointer",
              opacity: googleLoading ? 0.5 : 1,
              transition: "background 0.15s, transform 0.1s ease-out",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = DARK.googleBg; e.currentTarget.style.transform = "scale(1)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? t.redirectingEllipsis : t.continueWithGoogle}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.875rem", marginTop: 16, color: DARK.mutedText }}>
            {t.dontHaveAccount}{" "}
            <Link
              to="/signup"
              style={{ fontWeight: 500, color: DARK.gold, textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {t.signup}
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
