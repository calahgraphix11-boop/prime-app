import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

try {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />)
} catch (e) {
  document.getElementById('root').innerHTML = '<pre style="color:red;padding:20px;font-size:12px;">' + e.message + '\n' + e.stack + '</pre>'
}
