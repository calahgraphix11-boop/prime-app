import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Clock, FileText, GraduationCap, MessageCircle,
  Moon, Sun, Globe, LogOut, X, Settings, UserCircle, HelpCircle, Users, Trophy, Crown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import SupportModal from './SupportModal';
import UpgradeModal from './UpgradeModal';

export default function Sidebar({ open, onClose }) {
  const { darkMode, setDarkMode, toggleLang, t, activeSession, remaining, running } = useApp();
  const { user, profile, signOut, userPlan, trialExpired } = useAuth();
  const [supportOpen, setSupportOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const showUpgrade = userPlan === 'free' || trialExpired;

  const displayName = profile?.username || profile?.full_name || user?.email || '';
  const initials = (profile?.full_name || user?.email || '?').charAt(0).toUpperCase();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.dashboard, id: 'nav-dashboard' },
    { to: '/sessions', icon: Clock, label: t.studySessions, id: 'nav-sessions' },
    { to: '/report', icon: FileText, label: t.aiReportWriter, id: 'nav-report' },
    { to: '/exam-prep', icon: GraduationCap, label: 'Exam Coach' },
    { to: '/summarizer', icon: FileText, label: 'Note Summarizer' },
    { to: '/chat', icon: MessageCircle, label: t.aiChatbot, id: 'nav-studypal' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', id: 'nav-leaderboard' },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
    { to: '/settings', icon: Settings, label: t.settings, id: 'nav-settings' },
  ];

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />
      )}
      <aside
        id="prime-sidebar"
        className={`layout-sidebar fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Profile header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-sidebar-divider)' }}>
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-900 select-none"
              style={{ background: profile?.avatar_url ? 'transparent' : '#F5A800' }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {displayName}
              </p>
              {profile?.username && (
                <p className="text-xs text-white/35 truncate leading-tight">{user?.email}</p>
              )}
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="layout-icon-btn ml-3 flex-shrink-0 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, id }) => (
            <NavLink
              key={to}
              id={id}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-gray-900 shadow-md'
                    : 'text-white/65 hover:text-white hover:bg-white/10'
                }`
              }
              style={({ isActive }) => isActive ? { background: '#F5A800' } : {}}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Active session mini timer */}
        {activeSession && (() => {
          const m = Math.floor(remaining / 60).toString().padStart(2, "0");
          const s = (remaining % 60).toString().padStart(2, "0");
          return (
            <div
              className="mx-3 mb-2 px-3 py-2.5 rounded-xl flex items-center gap-2.5"
              style={{ background: 'rgba(245,168,0,0.1)', border: '1px solid rgba(245,168,0,0.25)' }}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${running ? 'animate-pulse' : ''}`}
                style={{ background: running ? '#F5A800' : 'rgba(255,255,255,0.3)' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: '#F5A800' }}>{activeSession.title}</div>
                <div className="text-xs font-mono text-white/50">{m}:{s} {running ? '· studying' : '· paused'}</div>
              </div>
            </div>
          );
        })()}

        {/* Bottom controls */}
        <div className="p-4 space-y-1" style={{ borderTop: '1px solid var(--color-sidebar-divider)' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/65 hover:text-white hover:bg-white/10 transition-all"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? t.lightMode : t.darkMode}
          </button>
          <button
            onClick={toggleLang}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/65 hover:text-white hover:bg-white/10 transition-all"
          >
            <Globe size={18} />
            {t.language}
          </button>
          {showUpgrade && (
            <button
              onClick={() => { setUpgradeOpen(true); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold btn-gold"
            >
              <Crown size={18} />
              Upgrade to Pro
            </button>
          )}
          <button
            onClick={() => { setSupportOpen(true); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/65 hover:text-white hover:bg-white/10 transition-all"
          >
            <HelpCircle size={18} />
            Contact Support
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/65 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={18} />
            {t.logout}
          </button>
          <p className="text-center text-xs pt-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Prime v1.1.0
          </p>
        </div>
      </aside>
      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}
