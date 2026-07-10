import { useState, useRef, useEffect } from 'react';
import { User, Camera, Save, Check, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import BadgeGrid from '../components/BadgeGrid';

export default function Profile() {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [earnedBadgeKeys, setEarnedBadgeKeys] = useState(new Set());
  const [badgesLoading, setBadgesLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_badges')
      .select('badge_key')
      .eq('user_id', user.id)
      .then(({ data, error: fetchErr }) => {
        if (fetchErr) { console.warn('[badges] failed to load user_badges:', fetchErr); return; }
        setEarnedBadgeKeys(new Set((data || []).map((row) => row.badge_key)));
      })
      .finally(() => setBadgesLoading(false));
  }, [user?.id]);

  const initials = (fullName || user?.email || '?').charAt(0).toUpperCase();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (avatarFile) {
        const { error: uploadErr } = await uploadAvatar(avatarFile);
        if (uploadErr) throw uploadErr;
        setAvatarFile(null);
      }
      const { error: profileErr } = await updateProfile({
        full_name: fullName.trim() || null,
        username: username.trim() || null,
      });
      if (profileErr) throw profileErr;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-white/50 mt-0.5">Manage your personal information</p>
      </div>

      {/* Avatar */}
      <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-900 select-none"
            style={{ background: avatarPreview ? 'transparent' : '#F5A800' }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-85 shadow-lg"
            style={{ background: '#F5A800' }}
            title="Upload photo"
          >
            <Camera size={14} className="text-gray-900" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="text-xs text-white/35">Click the camera icon to upload a new photo</p>
      </div>

      {/* Personal Info */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,168,0,0.2)' }}
          >
            <User size={16} style={{ color: '#F5A800' }} />
          </div>
          <h2 className="text-base font-semibold text-white">Personal Info</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder="e.g. studyking99"
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm"
            />
            <p className="text-xs text-white/30 mt-1">Letters, numbers, and underscores only</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <input
              value={user?.email || ''}
              readOnly
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white/35 cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 px-1">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
          style={saved ? { background: '#34d399', color: '#001a10' } : { background: '#F5A800', color: '#111' }}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Badges */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,168,0,0.2)' }}
          >
            <Award size={16} style={{ color: '#F5A800' }} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Badges</h2>
            <p className="text-xs text-white/35">{earnedBadgeKeys.size} of 8 earned</p>
          </div>
        </div>

        {badgesLoading ? (
          <div className="flex justify-center py-8">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#F5A800' }}
            />
          </div>
        ) : (
          <BadgeGrid earnedKeys={earnedBadgeKeys} />
        )}
      </div>
    </div>
  );
}
