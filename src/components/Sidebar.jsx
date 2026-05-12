import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Clock, FileText, MessageCircle,
  Moon, Sun, Globe, LogOut, X, Settings, UserCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { darkMode, setDarkMode, toggleLang, t } = useApp();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.username || profile?.full_name || user?.email || '';
  const initials = (profile?.full_name || user?.email || '?').charAt(0).toUpperCase();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.dashboard },
    { to: '/sessions', icon: Clock, label: t.studySessions },
    { to: '/report', icon: FileText, label: t.aiReportWriter },
    { to: '/chat', icon: MessageCircle, label: t.aiChatbot },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
    { to: '/settings', icon: Settings, label: t.settings },
  ];

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'rgba(0, 26, 14, 0.92)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Profile header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
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
            className="ml-3 flex-shrink-0 p-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
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

        {/* Bottom controls */}
        <div className="p-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/65 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={18} />
            {t.logout}
          </button>
        </div>
      </aside>
    </>
  );
}
