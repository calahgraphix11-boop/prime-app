import { useState } from 'react';
import { X, Zap, Star, Check, Tag, Crown } from 'lucide-react';
import { initiatePayment, PLANS } from '../lib/fapshi';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';


const EMPTY_COUPON_STATE = { code: '', checking: false, coupon: null, error: '' };

// Monthly caps roll over on the 1st, so the reset date is always the start of next month.
const nextResetDate = (lang) =>
  new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    .toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', day: 'numeric' });

export default function UpgradeModal({ onClose, defaultPlan }) {
  const { user, updateProfile, userPlan, planActive, trialExpired } = useAuth();
  const { t, lang } = useApp();
  const [loading, setLoading] = useState(null); // 'basic' | 'pro' | null
  const [error, setError] = useState('');
  // Pro is the default intent — Basic is the downgrade the user has to opt into.
  const [selected, setSelected] = useState(defaultPlan === 'basic' ? 'basic' : 'pro');

  const [couponStates, setCouponStates] = useState({
    basic: { ...EMPTY_COUPON_STATE },
    pro:   { ...EMPTY_COUPON_STATE },
  });
  const [freeSuccess, setFreeSuccess] = useState(false);

  const updateCoupon = (planKey, patch) =>
    setCouponStates(prev => ({ ...prev, [planKey]: { ...prev[planKey], ...patch } }));

  const discounted = (base, planKey) => {
    const c = couponStates[planKey]?.coupon;
    return c ? Math.round(base * (1 - c.discount_percent / 100)) : base;
  };

  const applyCoupon = async (planKey) => {
    const code = couponStates[planKey].code.trim().toUpperCase();
    if (!code) return;
    updateCoupon(planKey, { checking: true, error: '', coupon: null });
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('coupons')
      .select('id, code, discount_percent, max_uses, times_used, plan')
      .eq('code', code)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .maybeSingle();
    if (!data) {
      updateCoupon(planKey, { checking: false, error: t.couponInvalid });
    } else if (data.times_used >= data.max_uses) {
      updateCoupon(planKey, { checking: false, error: t.couponLimitReached });
    } else if (data.plan && data.plan !== planKey) {
      updateCoupon(planKey, { checking: false, error: `${t.couponNotValidForPlan} ${PLANS[planKey].label}.` });
    } else {
      updateCoupon(planKey, { checking: false, coupon: data });
    }
  };

  const subscribe = async (planKey) => {
    setError('');
    setLoading(planKey);
    const coupon = couponStates[planKey].coupon;
    try {
      const plan = PLANS[planKey];
      const finalAmount = discounted(plan.amount, planKey);

      if (finalAmount === 0) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 14);
        await updateProfile({ plan: planKey, plan_expiry: expiry.toISOString() });
        if (coupon) {
          const { data: couponRow } = await supabase
            .from('coupons')
            .select('id, times_used')
            .eq('code', coupon.code)
            .maybeSingle();
          if (couponRow) {
            await supabase
              .from('coupons')
              .update({ times_used: couponRow.times_used + 1 })
              .eq('id', couponRow.id);
          }
        }
        setFreeSuccess(true);
        setLoading(null);
        return;
      }

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
        throw new Error(t.noPaymentLinkError);
      }
    } catch (e) {
      setError(e.message);
      setLoading(null);
    }
  };

  const overlayStyle = {
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  if (freeSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={overlayStyle}>
        <div className="glass-elevated upgrade-shell rounded-3xl w-full max-w-sm p-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}
          >
            <Check size={26} style={{ color: '#34d399' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t.planActivatedTitle}</h2>
          <p className="text-sm text-white/50 mb-6">{t.planActivatedMessage}</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold btn-gold">
            {t.getStartedButton}
          </button>
        </div>
      </div>
    );
  }

  // profiles.plan is written as 'basic' at signup purely as the trial marker, so the
  // column alone proves nothing. It only describes a real subscription while planActive
  // is true (plan_expiry still in the future). Trial, expired-trial and lapsed users all
  // resolve to null here and are offered every tier.
  const subscribedPlan = planActive ? userPlan : null;

  // An active Pro subscriber has nothing left to buy. Reaching this modal means they hit
  // a monthly cap and tapped "Upgrade plan", so answer that question instead of rendering
  // nothing — a dead click reads as a broken button. Mirrors the limit-reached card used
  // in NoteSummarizer / ExamPrep.
  if (subscribedPlan === 'pro') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={overlayStyle}>
        <div className="glass-elevated upgrade-shell rounded-3xl w-full max-w-sm p-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={t.gotItButton}
          >
            <X size={18} />
          </button>

          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(245,168,0,0.15)', border: '1px solid rgba(245,168,0,0.3)' }}
          >
            <Crown size={26} style={{ color: '#F5A800' }} />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{t.onTopPlanTitle}</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            {t.onTopPlanMessage} {nextResetDate(lang)}.
          </p>

          <div
            className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold inline-block"
            style={{ background: 'rgba(245,168,0,0.12)', border: '1px solid rgba(245,168,0,0.3)', color: '#F5A800' }}
          >
            {t.onTopPlanBadge}
          </div>

          <button onClick={onClose} className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold btn-gold">
            {t.gotItButton}
          </button>
        </div>
      </div>
    );
  }

  const allTiers = [
    {
      key: 'basic',
      label: PLANS.basic.label,
      icon: <Star size={15} style={{ color: '#F5A800' }} />,
      features: PLANS.basic.features,
      checkColor: '#34d399',
      background: 'rgba(255,255,255,0.05)',
      border: '0.5px solid rgba(255,255,255,0.14)',
      badge: null,
      cta: t.continueWithBasic,
    },
    {
      key: 'pro',
      label: PLANS.pro.label,
      icon: <Zap size={15} style={{ color: '#F5A800' }} />,
      features: PLANS.pro.features,
      checkColor: '#F5A800',
      background: 'rgba(245,168,0,0.08)',
      border: '2px solid #F5A800',
      badge: t.mostPopularBadge,
      cta: t.continueWithPro,
    },
  ];

  const tiers = subscribedPlan === 'basic'
    ? allTiers.filter(tier => tier.key === 'pro')
    : allTiers;

  // A Basic subscriber is only ever shown Pro, so that is the only valid selection.
  const activeKey = tiers.some(tier => tier.key === selected) ? selected : tiers[0].key;
  const activeTier = tiers.find(tier => tier.key === activeKey);
  const activeCoupon = couponStates[activeKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={overlayStyle}>
      <div className="glass-elevated upgrade-shell rounded-3xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh] mt-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-5">
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(245,168,0,0.15)', border: '1px solid rgba(245,168,0,0.3)' }}
          >
            <Crown size={26} style={{ color: '#F5A800' }} />
          </div>
          <h2 className="text-xl font-bold text-white">{t.choosePlanTitle}</h2>
          <p className="text-sm text-white/50 mt-1">{t.choosePlanSubtitle}</p>
        </div>

        {/* Stacked on narrow widths, side-by-side from sm up */}
        <div className={`grid grid-cols-1 gap-4 ${tiers.length === 1 ? 'sm:max-w-xs sm:mx-auto' : 'sm:grid-cols-2'}`}>
          {tiers.map((tier, i) => {
            const isActive = tier.key === activeKey;
            return (
              <div
                key={tier.key}
                role="radio"
                tabIndex={0}
                aria-checked={isActive}
                onClick={() => setSelected(tier.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(tier.key); }
                }}
                className="upgrade-card rounded-xl p-4 flex flex-col relative cursor-pointer outline-none"
                style={{
                  '--card-delay': `${i * 60}ms`,
                  background: tier.background,
                  border: tier.border,
                  boxShadow: isActive ? '0 0 0 2px rgba(245,168,0,0.55)' : 'none',
                }}
              >
                {tier.badge && (
                  <div
                    className="absolute -top-2 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold leading-tight"
                    style={{ background: '#F5A800', color: '#1a0c00' }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                  {tier.icon}
                  <span className="font-semibold text-white text-sm">{tier.label}</span>
                </div>

                <div className="mb-3">
                  {couponStates[tier.key].coupon ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-white/35 line-through">
                        {PLANS[tier.key].amount.toLocaleString()}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {discounted(PLANS[tier.key].amount, tier.key).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {PLANS[tier.key].amount.toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm text-white/50 ml-1">{t.priceSuffixPerMonth}</span>
                  {!planActive && !trialExpired && (
                    <div
                      className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(245,168,0,0.15)', border: '1px solid rgba(245,168,0,0.35)', color: '#F5A800' }}
                    >
                      {t.freeTrialBadge24}
                    </div>
                  )}
                </div>

                <ul className="space-y-1.5 flex-1">
                  {tier.features.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-white/70">
                      <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color: tier.checkColor }} />
                      {t[key]}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Single primary CTA for whichever plan is selected */}
        <button
          onClick={() => subscribe(activeKey)}
          disabled={!!loading}
          className="mt-5 w-full py-3 rounded-xl text-sm font-semibold btn-gold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading === activeKey ? (
            <>
              <span
                className="w-3.5 h-3.5 border-2 rounded-full animate-spin inline-block"
                style={{ borderColor: 'rgba(120,60,0,0.3)', borderTopColor: 'rgba(120,60,0,0.9)' }}
              />
              {t.processingEllipsis}
            </>
          ) : activeTier.cta}
        </button>

        <p className="text-xs text-white/40 text-center mt-2.5">{t.cancelAnytimePayNote}</p>

        {/* Coupon applies to the selected plan */}
        <div className="mt-4 pt-4 max-w-sm mx-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                value={activeCoupon.code}
                onChange={(e) => updateCoupon(activeKey, { code: e.target.value.toUpperCase(), coupon: null, error: '' })}
                onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(activeKey); }}
                placeholder={t.couponCodePlaceholder}
                className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-sm font-mono tracking-wider"
                disabled={!!loading}
              />
            </div>
            <button
              onClick={() => applyCoupon(activeKey)}
              disabled={activeCoupon.checking || !activeCoupon.code.trim() || !!loading}
              className="px-3 py-2 rounded-xl text-sm font-semibold btn-ghost disabled:opacity-40 flex items-center gap-1.5"
            >
              {activeCoupon.checking ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              ) : t.applyCouponButton}
            </button>
          </div>

          {activeCoupon.coupon && (
            <div
              className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}
            >
              <Check size={12} />
              <span>
                <strong>{activeCoupon.coupon.discount_percent}% {t.couponDiscountLabel}</strong> {t.couponOffApplied}
              </span>
            </div>
          )}

          {activeCoupon.error && (
            <p
              className="mt-2 text-xs px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
            >
              {activeCoupon.error}
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

        <p className="text-xs text-white/30 text-center mt-4">{t.paymentsSecuredByFapshi}</p>
      </div>
    </div>
  );
}
