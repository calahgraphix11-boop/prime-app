/*
 * SQL — run once in Supabase SQL Editor before using payment features:
 *
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expiry timestamptz;
 */

const API_USER = import.meta.env.VITE_FAPSHI_API_USER;
const API_KEY = import.meta.env.VITE_FAPSHI_API_KEY;
const BASE = 'https://live.fapshi.com';

export const PLANS = {
  basic: {
    label: 'Basic',
    amount: 2500,
    features: [
      'Unlimited AI chats',
      '20 report rewrites per day',
      '10 note summarizations per day',
      '5 Exam Coach sessions per day',
      '5 file uploads per day',
      'Study session timer',
      'Basic analytics',
      'Leaderboard access',
      'Standard support',
    ],
  },
  pro: {
    label: 'Pro',
    amount: 5000,
    features: [
      'Unlimited AI chats',
      'Unlimited report rewrites',
      'Unlimited note summarizations',
      'Unlimited Exam Coach sessions',
      'Unlimited file uploads (PDF, images, docs)',
      'Advanced analytics with insights',
      'Leaderboard — compete globally and with friends',
      'Priority support',
      'Early access to new features',
    ],
  },
};

export async function initiatePayment({ amount, email, userId, plan }) {
  const externalId = `${userId}_${plan}_${Date.now()}`;
  const res = await fetch(`${BASE}/initiate-pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiuser: API_USER,
      apikey: API_KEY,
    },
    body: JSON.stringify({
      amount,
      email,
      redirectUrl: `https://primestudyapp.com/payment-success?plan=${plan}`,
      userId,
      externalId,
    }),
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
