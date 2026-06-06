import ReactDOM from "react-dom/client";
import "./index.css";

// Intercept Supabase recovery links before the router sees them.
// Supabase emails a URL like: https://app.com/#/reset-password%23access_token=...
// The encoded %23 means the router never matches /reset-password because it
// sees the whole thing as one unrecognised hash segment.
(function interceptRecoveryLink() {
  // Use hash only — works identically on www and non-www.
  // hash = "#/reset-password%23access_token=...&type=recovery"
  console.log("IIFE: hash =" + window.location.hash);
  const hash = window.location.hash;
  if (!hash.includes("access_token")) { console.log("IIFE: no token"); return; }

  let blob = "";
  if (hash.includes("%23")) {
    // Supabase encoded the second # as %23 inside the fragment.
    const raw = hash.slice(hash.indexOf("%23") + 3);
    try { blob = decodeURIComponent(raw); } catch (_) { blob = raw; }
  } else {
    // Two literal # characters: browser decoded %23 → #.
    const second = hash.indexOf("#", 1);
    if (second !== -1) blob = hash.slice(second + 1);
  }

  if (blob && blob.includes("type=recovery")) {
    sessionStorage.setItem("recovery_tokens", blob);
    console.log("IIFE: token stored");
    window.history.replaceState(null, "", "/#/reset-password");
  }
})();

window.onerror = function(msg, src, line, col, err) {
  document.getElementById('root').innerHTML = '<pre style="color:red;background:#000;padding:20px;font-size:11px;white-space:pre-wrap;">' + msg + '\n' + (err ? err.stack : '') + '</pre>'
  return true
}

window.onunhandledrejection = function(e) {
  document.getElementById('root').innerHTML = '<pre style="color:orange;background:#000;padding:20px;font-size:11px;white-space:pre-wrap;">Unhandled promise rejection:\n' + e.reason + '</pre>'
}

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
