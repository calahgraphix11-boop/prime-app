import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { t } = useApp();
  const { signIn, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err.message || "Google sign-in failed"); setGoogleLoading(false); }
  };
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message || "Invalid credentials");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="app-bg min-h-screen w-full flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-2 flex items-center justify-center"
            style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.08)', borderRadius: 24, backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <img src="/logo.png" alt="prime logo" style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 24 }} />
          </div>
        </div>

        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">{t.login}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/75">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/75">{t.password}</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl glass-input text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#004d2e' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-300 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm btn-gold mt-2"
            >
              {loading ? "..." : t.signIn}
            </button>
          </form>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-xs text-white/30 font-medium">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>
          <p className="text-center text-sm text-white/45 mt-4">
            {t.dontHaveAccount}{" "}
            <Link to="/signup" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
              {t.signup}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
