import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
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
  const daysSinceTrial = trialStartDate ? (Date.now() - trialStartDate.getTime()) / 86400000 : null;
  const trialActive = daysSinceTrial !== null && daysSinceTrial <= 1;
  const trialExpired = daysSinceTrial !== null && daysSinceTrial > 1;

  const userPlan = profile?.plan || 'free';
  const planExpiry = profile?.plan_expiry ? new Date(profile.plan_expiry) : null;
  const planActive = userPlan !== 'free' && planExpiry !== null && planExpiry > new Date();

  return (
    <AuthContext.Provider value={{ user, loading, profile, signIn, signUp, signInWithGoogle, signOut, updateProfile, uploadAvatar, trialActive, trialExpired, userPlan, planActive }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
