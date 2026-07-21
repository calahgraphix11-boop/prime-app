import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CHARACTERS } from '../lib/gamification';

export default function CharacterSelectModal({ onClose }) {
  const { profile, updateProfile } = useAuth();
  const [selecting, setSelecting] = useState(null);
  const [error, setError] = useState('');

  const handleSelect = async (key) => {
    setSelecting(key);
    setError('');
    const { error: updateErr } = await updateProfile({ character_avatar: key });
    setSelecting(null);
    if (updateErr) {
      setError('Could not save your pick. Try again.');
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <style>{`
        @keyframes charFadeScale { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
        .char-card { opacity: 0; animation: charFadeScale 280ms cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .char-card { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div className="glass-elevated rounded-3xl w-full max-w-md p-6 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Choose your character</h2>
          <p className="text-sm text-white/50 mt-1">Pick who represents you on your journey</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {CHARACTERS.map((c, i) => {
            const isSelected = profile?.character_avatar === c.key;
            return (
              <button
                key={c.key}
                onClick={() => handleSelect(c.key)}
                disabled={!!selecting}
                className="char-card rounded-2xl p-3 flex flex-col items-center gap-2 transition-transform hover:scale-[1.03] disabled:opacity-60"
                style={{
                  animationDelay: `${i * 70}ms`,
                  background: isSelected ? 'rgba(245,168,0,0.13)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '2px solid #F5A800' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
                  {selecting === c.key && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-white">{c.name}</span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#F5A800' }}>
                    <Check size={12} /> Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <p
            className="mt-4 text-sm text-center px-3 py-2 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
