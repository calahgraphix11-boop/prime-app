import { Component, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import StudySessions from "./pages/StudySessions";
import AIReportWriter from "./pages/AIReportWriter";
import AIChatbot from "./pages/AIChatbot";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Leaderboard from "./pages/Leaderboard";
import PublicProfile from "./pages/PublicProfile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import PaymentSuccess from "./pages/PaymentSuccess";
import NoteSummarizer from "./pages/NoteSummarizer";
import ExamPrep from "./pages/ExamPrep";
import Upgrade from "./pages/Upgrade";
import StudyGroups from "./pages/StudyGroups";
import JoinGroup from "./pages/JoinGroup";
import InternshipReport from "./pages/InternshipReport";
import UpgradeModal from "./components/UpgradeModal";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', color: 'red' }}>
          <h2>App crashed:</h2>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { user, loading, hasAccess } = useAuth();
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#001a10' }}>
        <div className="w-10 h-10 rounded-full border-4 border-green-900 border-t-yellow-500 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  // No active plan or trial — show the upgrade modal over the locked route.
  // The expired-trial banner (rendered in AuthContext) remains visible underneath.
  if (!hasAccess) return <UpgradeModal onClose={() => navigate('/')} />;
  return children;
}

// The fullscreen gate is no longer needed: the expired-trial banner (AuthContext)
// notifies the user, and ProtectedRoute shows the modal on locked-feature access.
function AccessGate({ children }) {
  return children;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#001a10' }}>
        <div className="w-10 h-10 rounded-full border-4 border-green-900 border-t-yellow-500 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout><Dashboard /></Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const pendingPlan = sessionStorage.getItem("pendingUpgradePlan");
      if (pendingPlan) {
        sessionStorage.removeItem("pendingUpgradePlan");
        navigate(`/upgrade?plan=${pendingPlan}`, { replace: true });
      }
    }
  }, [user]);

  return (
    <Routes>
<Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/verify-email" element={user ? <Navigate to="/" replace /> : <VerifyEmail />} />
      <Route path="/" element={<HomeRoute />} />
      <Route path="/sessions" element={<ProtectedRoute><Layout><StudySessions /></Layout></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><Layout><AIReportWriter /></Layout></ProtectedRoute>} />
      <Route path="/internship-report" element={<ProtectedRoute><Layout><InternshipReport /></Layout></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Layout><AIChatbot /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><Layout><Friends /></Layout></ProtectedRoute>} />
      <Route path="/study-groups" element={<ProtectedRoute><Layout><StudyGroups /></Layout></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><Layout><PublicProfile /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/summarizer" element={<ProtectedRoute><Layout><NoteSummarizer /></Layout></ProtectedRoute>} />
      <Route path="/exam-prep" element={<ProtectedRoute><Layout><ExamPrep /></Layout></ProtectedRoute>} />
      <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
      <Route path="/join/:inviteCode" element={<ProtectedRoute><Layout><JoinGroup /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <HashRouter>
          <AuthProvider>
            <AppProvider>
              <AccessGate>
                <AppRoutes />
              </AccessGate>
            </AppProvider>
          </AuthProvider>
        </HashRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
