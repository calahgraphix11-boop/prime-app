import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const TRIAL_NOTIF_KEY = 'showTrialNotification';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  // Prevent double-loading when both getSession and onAuthStateChange fire for the same user.
  const loadingForRef = useRef(null);

  const triggerTrialNotification = useCallback(() => {
    const timer = setTimeout(() => setShowTrialBanner(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const loadProfile = useCallback(async (userId) => {
    if (loadingForRef.current === userId) return;
    loadingForRef.current = userId;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!data) {
      // Brand-new user (e.g. Google OAuth) — no profile row yet.
      const now = new Date().toISOString();
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .upsert({ id: userId, plan: 'basic', trial_start_date: now }, { onConflict: 'id' })
        .select()
        .single();
      if (!insertError) {
        setProfile(newProfile);
        triggerTrialNotification();
      }
      loadingForRef.current = null;
      return;
    }

    if (!data.trial_start_date && (data.plan === 'free' || !data.plan)) {
      const now = new Date().toISOString();
      const { data: updated } = await supabase
        .from('profiles')
        .update({ plan: 'basic', trial_start_date: now })
        .eq('id', userId)
        .select()
        .single();
      await supabase.from('notifications').insert({
        user_id: userId,
        message: 'Your account has been upgraded to a 24-hour free trial of Basic. Upgrade before it expires to keep access to all features.',
        read: false,
        created_at: now,
      });
      setProfile(updated || data);
      triggerTrialNotification();
      loadingForRef.current = null;
      return;
    }

    // Email-confirmation flow: signUp stored this flag after the profile was inserted
    // pre-session; we pick it up here on first post-verification login.
    if (sessionStorage.getItem(TRIAL_NOTIF_KEY) === userId) {
      sessionStorage.removeItem(TRIAL_NOTIF_KEY);
      triggerTrialNotification();
    }

    setProfile(data);
    loadingForRef.current = null;
  }, [triggerTrialNotification]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); loadingForRef.current = null; }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email, password, fullName) => {
    // IMPORTANT — Supabase dashboard: Authentication → Email Templates → "Confirm signup"
    // must use {{ .Token }} (6-digit OTP) NOT {{ .ConfirmationURL }} (magic link).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: { full_name: fullName, email_confirm: true },
      },
    });

    if (!error && data.user) {
      const now = new Date().toISOString();
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, plan: 'basic', trial_start_date: now }, { onConflict: 'id' });

      if (data.session) {
        // Immediate login (no email confirmation) — gate on profile insert.
        if (profileError) return { error: profileError, needsEmailConfirmation: false };
        triggerTrialNotification();
      } else {
        // Email confirmation required — RLS may block the upsert; loadProfile will
        // retry on first login. Store flag so it knows to show the notification.
        if (!profileError) sessionStorage.setItem(TRIAL_NOTIF_KEY, data.user.id);
      }
    }

    return { error, needsEmailConfirmation: !error && !data.session };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://primestudyapp.com/login' },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { error };
  };

  const uploadAvatar = async (file) => {
    if (!user) return { error: new Error('Not authenticated') };
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (uploadError) return { error: uploadError };
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;
    const { error } = await updateProfile({ avatar_url: avatarUrl });
    return { error, url: avatarUrl };
  };

  const trialStartDate = profile?.trial_start_date ? new Date(profile.trial_start_date) : null;
  const msSinceTrial = trialStartDate ? Date.now() - trialStartDate.getTime() : null;
  const trialActive = msSinceTrial !== null && msSinceTrial < 24 * 60 * 60 * 1000;
  const trialExpired = msSinceTrial !== null && msSinceTrial >= 24 * 60 * 60 * 1000;

  const userPlan = profile?.plan || 'basic';
  const planExpiry = profile?.plan_expiry ? new Date(profile.plan_expiry) : null;
  const planActive = (userPlan === 'basic' || userPlan === 'pro') && planExpiry !== null && planExpiry > new Date();
  // Grant access when the 24-hour trial is running, regardless of plan_expiry.
  // Also default to true while the profile row is still being fetched so a
  // freshly signed-up user is never flashed the upgrade modal.
  const hasAccess = trialActive || planActive || (user !== null && profile === null);

  return (
    <AuthContext.Provider value={{ user, loading, profile, signIn, signUp, signInWithGoogle, signOut, updateProfile, uploadAvatar, trialActive, trialExpired, userPlan, planActive, hasAccess, showTrialBanner }}>
      {children}
      {showTrialBanner && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12,
          background: '#0d2b1a', border: '1px solid #F5A800', borderRadius: 12,
          padding: '12px 16px 12px 20px', boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
          maxWidth: 480, width: 'calc(100vw - 48px)',
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.45, flex: 1 }}>
            Your 24-hour free trial of Prime Basic has started. Upgrade before it expires to keep access.
          </span>
          <button
            onClick={() => setShowTrialBanner(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 20, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0 }}
            aria-label="Dismiss"
          >×</button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
