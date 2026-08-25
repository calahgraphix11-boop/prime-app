import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { checkPaymentStatus } from '../lib/fapshi';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function PaymentSuccess() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [status, setStatus] = useState('checking'); // 'checking' | 'success' | 'pending' | 'failed'
  const [planLabel, setPlanLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(search);
    const transId = params.get('transId');
    const plan = params.get('plan') || 'basic';
    setPlanLabel(plan === 'pro' ? 'Pro' : 'Basic');

    if (!transId) {
      setStatus('failed');
      setErrorMsg('No transaction ID found. If you completed a payment, contact support.');
      return;
    }

    (async () => {
      try {
        const data = await checkPaymentStatus(transId);
        if (data.status === 'SUCCESSFUL') {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          console.log('[PaymentSuccess] user:', user?.id, 'plan:', plan);
          const result = await updateProfile({ plan, plan_expiry: expiry.toISOString() });
          console.log('[PaymentSuccess] updateProfile result:', result);
          const couponCode = params.get('coupon');
          if (couponCode) {
            const { data: couponRow } = await supabase
              .from('coupons')
              .select('id, times_used')
              .eq('code', couponCode)
              .maybeSingle();
            if (couponRow) {
              await supabase
                .from('coupons')
                .update({ times_used: couponRow.times_used + 1 })
                .eq('id', couponRow.id);
            }
          }
          setStatus('success');
        } else if (data.status === 'PENDING') {
          setStatus('pending');
          setErrorMsg('Payment is still pending. Complete your mobile money prompt then check back — your plan will activate automatically.');
        } else {
          setStatus('failed');
          setErrorMsg('Payment was not completed. No charges were made. Try again or contact support.');
        }
      } catch (e) {
        setStatus('failed');
        setErrorMsg(e.message || 'Could not verify your payment. Contact support if you were charged.');
      }
    })();
  }, [search, updateProfile]);

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4">
      <div className="glass-elevated rounded-3xl p-8 max-w-md w-full text-center">

        {status === 'checking' && (
          <>
            <Loader size={48} className="mx-auto mb-5 animate-spin" style={{ color: '#F5A800' }} />
            <h2 className="text-xl font-bold text-white mb-2">Verifying your payment…</h2>
            <p className="text-sm text-white/50">This will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}
            >
              <CheckCircle size={32} style={{ color: '#34d399' }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">You're on {planLabel}!</h2>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Your subscription is active for 30 days. Enjoy unlimited AI chats and the full Prime experience.
            </p>
            <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl text-sm font-semibold btn-gold">
              Start studying
            </button>
          </>
        )}

        {(status === 'pending' || status === 'failed') && (
          <>
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: status === 'pending' ? 'rgba(245,168,0,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${status === 'pending' ? 'rgba(245,168,0,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}
            >
              <XCircle size={32} style={{ color: status === 'pending' ? '#F5A800' : '#f87171' }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {status === 'pending' ? 'Awaiting payment confirmation' : 'Payment not completed'}
            </h2>
            <p className="text-sm text-white/55 leading-relaxed mb-6">{errorMsg}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-xl text-sm font-semibold btn-ghost">
                Go home
              </button>
              <button onClick={() => navigate('/chat')} className="flex-1 py-3 rounded-xl text-sm font-semibold btn-gold">
                Try again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
