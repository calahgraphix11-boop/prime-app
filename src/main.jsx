import ReactDOM from "react-dom/client";
import "./index.css";

// Intercept Supabase recovery links before the router sees them.
// Supabase emails a URL like: https://app.com/#/reset-password%23access_token=...
// The encoded %23 means the router never matches /reset-password because it
// sees the whole thing as one unrecognised hash segment.
(function interceptRecoveryLink() {
  const href = window.location.href;
  if (href.includes("access_token") && href.includes("type=recovery")) {
    let blob;
    if (href.includes("%23")) {
      blob = decodeURIComponent(href.split("%23")[1]);
    } else {
      const parts = href.split("#");
      blob = parts[2] || "";
    }
    if (blob) {
      sessionStorage.setItem("recovery_tokens", blob);
      window.history.replaceState(null, "", "/#/reset-password");
    }
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
