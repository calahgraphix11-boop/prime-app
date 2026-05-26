import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Clock, FileText, GraduationCap, MessageCircle,
  Moon, Sun, Globe, LogOut, X, Settings, UserCircle, HelpCircle, Users, Users2, Trophy, Crown,
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
    { to: '/report', icon: FileText, label: t.aiReportWriter, id: 'nav-report' },
    { to: '/internship-report', icon: FileText, label: 'Internship Report' },
    { to: '/exam-prep', icon: GraduationCap, label: 'Exam Coach' },
    { to: '/summarizer', icon: FileText, label: 'Note Summarizer' },
    { to: '/chat', icon: MessageCircle, label: t.aiChatbot, id: 'nav-studypal' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/settings', icon: Settings, label: t.settings, id: 'nav-settings' },
  ];

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 md:hidden" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={onClose} />
      )}
      <aside
        id="prime-sidebar"
        className={`layout-sidebar fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand + close */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-sidebar-divider)' }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', system-ui", fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #fff 40%, rgba(245,168,0,0.9) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Prime
          </span>
          <button onClick={onClose} className="layout-icon-btn p-1.5 rounded-lg transition-colors">
            <X size={17} className="text-white/50" />
          </button>
        </div>

        {/* Profile */}
        <NavLink
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 mx-3 mt-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5"
        >
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-900 select-none"
            style={{ background: profile?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #FFBC1F, #F5A800)', boxShadow: '0 0 0 2px rgba(245,168,0,0.2)' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-snug">{displayName}</p>
            {profile?.username && (
              <p className="text-xs text-white/30 truncate leading-snug">{user?.email}</p>
            )}
          </div>
          {userPlan === 'pro' && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: 'linear-gradient(135deg,#FFBC1F,#F5A800)', color: '#110800' }}>PRO</span>
          )}
          {userPlan === 'basic' && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-xs font-semibold" style={{ border: '1px solid rgba(245,168,0,0.5)', color: '#F5A800' }}>BASIC</span>
          )}
        </NavLink>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, id }) => (
            <NavLink
              key={to}
              id={id}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative overflow-hidden ${
                  isActive ? 'font-semibold' : 'font-medium text-white/55 hover:text-white/85 hover:bg-white/6'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(245,168,0,0.1)',
                color: '#F5A800',
                boxShadow: 'inset 2px 0 0 #F5A800',
              } : {}}
            >
              <Icon size={17} />
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
              style={{ background: 'rgba(245,168,0,0.08)', border: '1px solid rgba(245,168,0,0.2)', boxShadow: '0 0 12px rgba(245,168,0,0.06)' }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${running ? 'animate-pulse' : ''}`}
                style={{ background: running ? '#F5A800' : 'rgba(255,255,255,0.25)' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: '#F5A800' }}>{activeSession.title}</div>
                <div className="text-xs text-white/40" style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}>{m}:{s} <span className="text-white/25">{running ? '· live' : '· paused'}</span></div>
              </div>
            </div>
          );
        })()}

        {/* Bottom controls */}
        <div className="px-3 pb-4 pt-2 space-y-0.5" style={{ borderTop: '1px solid var(--color-sidebar-divider)' }}>
          {showUpgrade && (
            <button
              onClick={() => { setUpgradeOpen(true); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold btn-gold mb-2"
            >
              <Crown size={16} />
              Upgrade to Pro
            </button>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white/85 hover:bg-white/6 transition-all"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? t.lightMode : t.darkMode}
          </button>
          <button
            onClick={toggleLang}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white/85 hover:bg-white/6 transition-all"
          >
            <Globe size={16} />
            {t.language}
          </button>
          <button
            onClick={() => { setSupportOpen(true); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white/85 hover:bg-white/6 transition-all"
          >
            <HelpCircle size={16} />
            Contact Support
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/6 transition-all"
          >
            <LogOut size={16} />
            {t.logout}
          </button>
          <p className="text-center text-xs pt-1.5" style={{ color: 'rgba(255,255,255,0.12)', letterSpacing: '0.04em' }}>
            PRIME v1.1.0
          </p>
        </div>
      </aside>
      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}
