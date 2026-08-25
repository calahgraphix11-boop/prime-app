/*
 * SQL — run once in Supabase SQL Editor before using payment features:
 *
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expiry timestamptz;
 *
 * create table if not exists coupons (
 *   id uuid default gen_random_uuid() primary key,
 *   code text unique not null,
 *   discount_percent int not null,
 *   max_uses int default 1,
 *   times_used int default 0,
 *   expires_at timestamp with time zone,
 *   is_active boolean default true
 * );
 * alter table coupons enable row level security;
 * create policy "Authenticated users can read active coupons" on coupons
 *   for select to authenticated using (is_active = true);
 * create policy "Authenticated users can increment times_used" on coupons
 *   for update to authenticated using (true) with check (true);
 */

import { supabase } from './supabase';

const API_USER = import.meta.env.VITE_FAPSHI_API_USER;
const API_KEY = import.meta.env.VITE_FAPSHI_API_KEY;
const BASE = 'https://live.fapshi.com';

export const PLANS = {
  // `features` holds i18n keys, not display strings — the wording lives in
  // i18n/en.js + i18n/fr.js and is resolved with `t[key]` at render time.
  // This array only decides which bullets each tier lists, in order.
  basic: {
    label: 'Basic',
    amount: 2499,
    features: [
      'planFeatureUnlimitedChats',
      'planFeatureExamSessionsBasic',
      'planFeatureSummariesBasic',
      'planFeatureUploadsBasic',
      'planFeatureStudyTimer',
      'planFeatureBasicAnalytics',
      'planFeatureLeaderboard',
      'planFeatureStandardSupport',
    ],
  },
  pro: {
    label: 'Pro',
    amount: 4999,
    features: [
      'planFeatureUnlimitedChats',
      'planFeatureUnlimitedExams',
      'planFeatureUnlimitedUploads',
      'planFeatureSummariesPro',
      'planFeatureAdvancedAnalytics',
      'planFeatureLeaderboardGlobal',
      'planFeaturePrioritySupport',
      'planFeatureEarlyAccess',
    ],
  },
};

export async function initiatePayment({ amount, email, userId, plan, coupon }) {
  const externalId = `${userId}_${plan}_${Date.now()}`;
  const redirectUrl = `https://primestudyapp.com/payment-success?plan=${plan}${coupon ? `&coupon=${encodeURIComponent(coupon)}` : ''}`;
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('https://dqxymdocyxzzqvulleob.supabase.co/functions/v1/fapshi-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ amount, email, redirectUrl, userId, plan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Payment initiation failed');
  }
  return res.json();
}

export async function checkPaymentStatus(transId) {
  const res = await fetch(`${BASE}/payment-status/${transId}`, {
    headers: {
      apiuser: API_USER,
      apikey: API_KEY,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Status check failed');
  }
  return res.json();
}
