import { useState } from 'react';
import { X, Zap, Star, Check, Tag } from 'lucide-react';
import { initiatePayment, PLANS } from '../lib/fapshi';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function UpgradeModal({ onClose, defaultPlan }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null); // 'basic' | 'pro' | null
  const [error, setError] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const discounted = (base) =>
    coupon ? Math.round(base * (1 - coupon.discount_percent / 100)) : base;

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponChecking(true);
    setCouponError('');
    setCoupon(null);
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('coupons')
      .select('id, code, discount_percent, max_uses, times_used')
      .eq('code', code)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .maybeSingle();
    if (!data) {
      setCouponError('Invalid or expired coupon code.');
    } else if (data.times_used >= data.max_uses) {
      setCouponError('This coupon has reached its usage limit.');
    } else {
      setCoupon(data);
    }
    setCouponChecking(false);
  };

  const subscribe = async (planKey) => {
    setError('');
    setLoading(planKey);
    try {
      const plan = PLANS[planKey];
      const finalAmount = discounted(plan.amount);
      const data = await initiatePayment({
        amount: finalAmount,
        email: user.email,
        userId: user.id,
        plan: planKey,
        coupon: coupon?.code || null,
      });
      if (data.link) {
        window.location.href = data.link;
      } else {
        throw new Error('No payment link returned. Please try again.');
      }
    } catch (e) {
      setError(e.message);
      setLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="glass-elevated rounded-3xl w-full max-w-xl p-6 relative overflow-y-auto max-h-[90vh] mt-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(245,168,0,0.15)', border: '1px solid rgba(245,168,0,0.3)' }}
          >
            <Zap size={22} style={{ color: '#F5A800' }} />
          </div>
          <h2 className="text-xl font-bold text-white">Upgrade your plan</h2>
          <p className="text-sm text-white/50 mt-1">Remove all limits and unlock the full Prime experience</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Basic */}
          <div
            className="rounded-2xl p-5 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.07)', border: defaultPlan === 'basic' ? '2px solid #F5A800' : '1px solid rgba(255,255,255,0.14)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Star size={15} style={{ color: '#F5A800' }} />
              <span className="font-semibold text-white text-sm">Basic</span>
            </div>
            <div className="mb-4">
              {coupon ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-white/35 line-through">{PLANS.basic.amount.toLocaleString()}</span>
                  <span className="text-2xl font-bold text-white">{discounted(PLANS.basic.amount).toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-white">2,500</span>
              )}
              <span className="text-sm text-white/50 ml-1">FCFA/mo</span>
            </div>
            <ul className="space-y-2 flex-1 mb-5">
              {PLANS.basic.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#34d399' }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => subscribe('basic')}
              disabled={!!loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold btn-ghost disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'basic' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Processing…
                </>
              ) : (
                'Subscribe to Basic'
              )}
            </button>
          </div>

          {/* Pro */}
          <div
            className="rounded-2xl p-5 flex flex-col relative overflow-hidden"
            style={{ background: 'rgba(245,168,0,0.08)', border: defaultPlan === 'pro' ? '2px solid #F5A800' : '1px solid rgba(245,168,0,0.35)' }}
          >
            <div
              className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: '#F5A800', color: '#1a0c00' }}
            >
              POPULAR
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={15} style={{ color: '#F5A800' }} />
              <span className="font-semibold text-white text-sm">Pro</span>
            </div>
            <div className="mb-4">
              {coupon ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-white/35 line-through">{PLANS.pro.amount.toLocaleString()}</span>
                  <span className="text-2xl font-bold text-white">{discounted(PLANS.pro.amount).toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-white">5,000</span>
              )}
              <span className="text-sm text-white/50 ml-1">FCFA/mo</span>
            </div>
            <ul className="space-y-2 flex-1 mb-5">
              {PLANS.pro.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#F5A800' }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => subscribe('pro')}
              disabled={!!loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold btn-gold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'pro' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin inline-block" />
                  Processing…
                </>
              ) : (
                'Subscribe to Pro'
              )}
            </button>
          </div>
        </div>

        {/* Coupon */}
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCoupon(null);
                  setCouponError('');
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(); }}
                placeholder="Coupon code"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl glass-input text-sm font-mono tracking-wider"
                disabled={!!loading}
              />
            </div>
            <button
              onClick={applyCoupon}
              disabled={couponChecking || !couponCode.trim() || !!loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold btn-ghost disabled:opacity-40 flex items-center gap-1.5"
            >
              {couponChecking ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              ) : 'Apply'}
            </button>
          </div>

          {coupon && (
            <div
              className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}
            >
              <Check size={13} />
              <span><strong>{coupon.discount_percent}% off</strong> applied — prices updated above</span>
            </div>
          )}

          {couponError && (
            <p
              className="mt-2.5 text-sm px-3 py-2 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
            >
              {couponError}
            </p>
          )}
        </div>

        {error && (
          <p
            className="mt-4 text-sm text-center px-3 py-2 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
          >
            {error}
          </p>
        )}

        <p className="text-xs text-white/30 text-center mt-4">
          Payments processed securely by Fapshi · MTN Mobile Money & Orange Money
        </p>
      </div>
    </div>
  );
}
