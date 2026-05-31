import ReactDOM from "react-dom/client";
import "./index.css";

window.onerror = function(msg, src, line, col, err) {
  document.getElementById('root').innerHTML = '<pre style="color:red;background:#000;padding:20px;font-size:11px;white-space:pre-wrap;">' + msg + '\n' + (err ? err.stack : '') + '</pre>'
  return true
}

window.onunhandledrejection = function(e) {
  document.getElementById('root').innerHTML = '<pre style="color:orange;background:#000;padding:20px;font-size:11px;white-space:pre-wrap;">Unhandled promise rejection:\n' + e.reason + '</pre>'
}

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
