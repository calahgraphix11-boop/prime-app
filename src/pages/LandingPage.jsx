import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Timer, FileText, BookOpen,
  Zap, ChevronRight, ChevronDown, Check, Star,
  Users, TrendingUp, Smartphone, Headphones, Flame, Clock,
} from 'lucide-react';

// ── Utilities ────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useTilt() {
  const ref = useRef(null);
  const onMouseMove = (e) => {
    const card = ref.current;
    if (!card) return;
    if (window.matchMedia('(max-width: 639px)').matches) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transition = 'transform 0.06s ease-out, box-shadow 0.06s ease-out';
    card.style.transform = `perspective(720px) rotateY(${x * 11}deg) rotateX(${-y * 11}deg) translateZ(10px)`;
  };
  const onMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.45s ease-out, box-shadow 0.45s ease-out';
    ref.current.style.transform = 'perspective(720px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
  };
  return { ref, onMouseMove, onMouseLeave };
}

// ── Hero mockup ──────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="lp-float" style={{ width: '100%', maxWidth: 320, position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: -30,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(245,168,0,0.18) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        background: 'rgba(0,16,8,0.88)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(245,168,0,0.22)',
        borderRadius: 22,
        padding: '22px 20px 20px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div style={{
          background: 'rgba(245,168,0,0.08)',
          border: '1px solid rgba(245,168,0,0.2)',
          borderRadius: 14, padding: '12px 16px',
          textAlign: 'center', marginBottom: 14,
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 34, fontWeight: 700,
            color: '#fff', letterSpacing: 3, lineHeight: 1,
          }}>24:37</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 4, letterSpacing: '1px' }}>
            STUDYING
          </div>
          <div style={{ fontSize: 11, color: '#F5A800', marginTop: 6, fontWeight: 600 }}>
            Calculus Review
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 11, lineHeight: 1.45 }}>
          <div style={{
            alignSelf: 'flex-end',
            background: '#F5A800', color: '#111',
            borderRadius: '12px 12px 3px 12px',
            padding: '7px 11px', maxWidth: '86%', fontWeight: 500,
          }}>
            Explain L'Hôpital's rule simply
          </div>
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.82)',
            borderRadius: '12px 12px 12px 3px',
            padding: '7px 11px', maxWidth: '92%',
          }}>
            When you get 0/0 or ∞/∞, differentiate the top and bottom separately — then re-evaluate…
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
          background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 8, padding: '5px 10px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#34d399', fontWeight: 600 }}>StudyPal active</span>
        </div>
      </div>
    </div>
  );
}

// ── Feature data ─────────────────────────────────────────────

const FEATURES = [
  {
    icon: MessageCircle, color: '#F5A800',
    bg: 'rgba(245,168,0,0.1)', border: 'rgba(245,168,0,0.18)',
    title: 'StudyPal Chatbot',
    desc: 'Ask anything mid-session. Get instant, contextual explanations powered by AI without leaving your timer.',
  },
  {
    icon: FileText, color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.15)',
    title: 'AI Report Writer',
    desc: 'Rewrite and polish academic reports in any tone — formal, casual, or technical — in one click.',
  },
  {
    icon: Timer, color: '#34d399',
    bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.15)',
    title: 'Study Timer + Pomodoro',
    desc: 'Pomodoro and free-form sessions with circular progress. Every minute tracked toward your weekly goal.',
  },
  {
    icon: TrendingUp, color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.15)',
    title: 'Analytics & Streaks',
    desc: 'See your study patterns, track streaks, and get weekly insights to stay on course.',
  },
  {
    icon: Zap, color: '#f472b6',
    bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.15)',
    title: 'Exam Coach',
    desc: 'Upload study material and receive practice questions, flashcards, and targeted exam strategies.',
  },
  {
    icon: BookOpen, color: '#22d3ee',
    bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.15)',
    title: 'Note Summarizer',
    desc: 'Paste lecture notes and get a crisp summary with key points extracted automatically.',
  },
  {
    icon: Flame, color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.15)',
    title: 'The Grind Board',
    desc: 'Weekly challenges and milestones that push you to hit new personal bests and keep the momentum going.',
  },
  {
    icon: Users, color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.15)',
    title: 'Friends & Study Network',
    desc: 'Connect with classmates, compare study stats, and cheer each other on to the finish line.',
  },
  {
    icon: Headphones, color: '#c084fc',
    bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.15)',
    title: 'AI Support Agent',
    desc: 'Stuck? Our AI support agent is available 24/7 to help with any question or issue you run into.',
  },
  {
    icon: Smartphone, color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.15)',
    title: 'Pay with Mobile Money',
    desc: 'Subscribe with MTN or Orange Mobile Money — no credit card, no hassle. Built for Cameroon.',
  },
];

function FeatureCard({ feature, index, inView }) {
  const tilt = useTilt();
  const Icon = feature.icon;
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="lp-feature-card"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${feature.border}`,
        borderRadius: 18, padding: '24px 22px',
        cursor: 'default',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 0.52s ease ${index * 0.06}s, transform 0.52s ease ${index * 0.06}s`,
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 13,
        background: feature.bg, border: `1px solid ${feature.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Icon size={20} style={{ color: feature.color }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 7 }}>
        {feature.title}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>
        {feature.desc}
      </div>
    </div>
  );
}

// ── FAQ data ─────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How is Prime different from ChatGPT?',
    a: 'Prime is built specifically for university students in Cameroon. It combines an AI tutor, Pomodoro timer, streak tracking, report writer, and exam coaching — all in one place, without needing to switch between tools.',
  },
  {
    q: 'What subjects does Prime support?',
    a: 'Prime supports all university subjects. Our AI can help with Mathematics, Sciences, Literature, Law, Engineering, Medicine, and more — in English and French.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Your study data and conversations are private to you. We never sell your data to third parties, and your sessions are encrypted in transit and at rest.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. There are no long-term contracts or lock-ins. Cancel your subscription at any time from your account settings — no questions asked.',
  },
  {
    q: 'Does Prime work on mobile?',
    a: 'Yes! Prime is fully responsive and works great on any smartphone or tablet browser. A dedicated mobile app is also on the roadmap.',
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
          padding: '20px 0', background: 'none', border: 'none',
          color: '#fff', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>{item.q}</span>
        <ChevronDown
          size={18}
          style={{
            color: '#F5A800', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        />
      </button>
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? 200 : 0,
        transition: 'max-height 0.3s ease',
      }}>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.52)',
          lineHeight: 1.75, margin: '0 0 20px',
        }}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

// ── Pricing data ─────────────────────────────────────────────

const FREE_FEATURES = [
  '3 AI chats/day',
  '1 AI report/day',
  'Basic Pomodoro',
  'Study analytics',
];
const BASIC_FEATURES = [
  'Unlimited AI chat',
  '10 AI reports/day',
  'All features',
  'Pomodoro',
  'Streak tracking',
];
const PRO_FEATURES = [
  'Unlimited everything',
  'Smarter AI (Sonnet)',
  'Priority support',
  'Full analytics',
  'Weekly progress reports',
];

// ── Headline words ────────────────────────────────────────────

const HEADLINE = ['Study', 'Smarter.', 'Compete', 'Harder.', 'Graduate', 'Stronger.'];

// ── Landing page ─────────────────────────────────────────────

export default function LandingPage() {
  const parallaxRef = useRef(null);
  const [navReady, setNavReady] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [featRef, featInView] = useInView(0.05);
  const [priceRef, priceInView] = useInView(0.06);
  const [problemRef, problemInView] = useInView(0.1);
  const [solutionRef, solutionInView] = useInView(0.1);
  const [faqRef, faqInView] = useInView(0.08);
  const [ctaRef, ctaInView] = useInView(0.1);

  useEffect(() => { const id = setTimeout(() => setNavReady(true), 60); return () => clearTimeout(id); }, []);

  useEffect(() => {
    const handle = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.32}px)`;
      }
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <div style={{ background: '#001a10', minHeight: '100vh', overflowX: 'hidden', color: '#fff' }}>

      {/* ── Navbar ────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: navReady ? 'rgba(0,18,8,0.75)' : 'transparent',
        backdropFilter: navReady ? 'blur(22px)' : 'none',
        WebkitBackdropFilter: navReady ? 'blur(22px)' : 'none',
        borderBottom: navReady ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transform: navReady ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), background 0.5s ease, border-color 0.5s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/logo.png" alt="Prime"
            style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.4px' }}>Prime</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['Features', 'Pricing', 'FAQ'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                padding: '7px 12px', borderRadius: 8,
                color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'color 0.18s',
                display: 'none',
              }}
              className="lp-nav-link"
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            >
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" style={{
            padding: '7px 14px', borderRadius: 9,
            color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'color 0.18s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
          >Sign In</Link>
          <Link to="/signup" style={{
            padding: '7px 18px', borderRadius: 9,
            background: '#F5A800', color: '#1a0c00',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.87'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        paddingTop: 60,
      }}>
        <div ref={parallaxRef} style={{
          position: 'absolute', inset: '-10% -5%',
          background: 'radial-gradient(ellipse 90% 65% at 50% 38%, rgba(0,80,48,0.65) 0%, rgba(0,40,24,0.32) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.045,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '72px 24px 80px',
          display: 'flex', alignItems: 'center',
          gap: 48, width: '100%', flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {/* Text side */}
          <div style={{ flex: '1 1 440px', maxWidth: 560 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(245,168,0,0.1)', border: '1px solid rgba(245,168,0,0.28)',
              borderRadius: 999, padding: '5px 13px', marginBottom: 26,
              opacity: 0,
              animation: 'lp-fade-up 0.55s ease 0.15s forwards',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A800' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#F5A800', letterSpacing: '0.4px' }}>
                AI-powered study companion
              </span>
            </div>

            {/* Headline — word by word */}
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 62px)',
              fontWeight: 800, lineHeight: 1.08,
              letterSpacing: '-2px', margin: '0 0 26px',
            }}>
              {HEADLINE.map((word, i) => (
                <span key={word + i} style={{
                  display: 'inline-block',
                  marginRight: '0.24em',
                  color: word === 'Stronger.' ? '#F5A800' : '#fff',
                  opacity: 0,
                  animation: `lp-word-reveal 0.6s cubic-bezier(0.22,1,0.36,1) ${0.32 + i * 0.13}s forwards`,
                }}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.72,
              maxWidth: 460, margin: '0 0 34px',
              opacity: 0, animation: 'lp-fade-up 0.6s ease 1.12s forwards',
            }}>
              Prime gives university students in Cameroon AI-powered tools to study, track progress, and stay motivated — all in one place.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              opacity: 0, animation: 'lp-fade-up 0.55s ease 1.28s forwards',
            }}>
              <Link to="/signup" className="lp-cta-shimmer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 26px', borderRadius: 12,
                background: '#F5A800', color: '#1a0c00',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>
                Start for Free <ChevronRight size={15} />
              </Link>
              <a href="#solution" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px', borderRadius: 12,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.78)', fontWeight: 600, fontSize: 14,
                textDecoration: 'none', transition: 'background 0.18s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              >
                See How It Works
              </a>
            </div>

            {/* Trust line */}
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.32)', margin: '16px 0 0',
              opacity: 0, animation: 'lp-fade-up 0.55s ease 1.38s forwards',
            }}>
              ✓ No credit card required · ✓ Free plan available · ✓ Cancel anytime
            </p>

            {/* Social proof stats */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '10px 28px', marginTop: 28,
              opacity: 0, animation: 'lp-fade-up 0.55s ease 1.48s forwards',
            }}>
              {[
                { n: '50K+', label: 'Students studying with Prime daily' },
                { n: '4.9/5', label: 'Average rating' },
                { n: '2M+', label: 'Study sessions completed' },
              ].map(({ n, label }) => (
                <div key={n}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#F5A800' }}>{n}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 5 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup side */}
          <div style={{
            flex: '0 0 auto', display: 'flex', justifyContent: 'center',
            opacity: 0, animation: 'lp-fade-up 0.65s ease 0.72s forwards',
          }}>
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ── Problem section ────────────────────────────────── */}
      <section style={{ padding: '88px 24px 72px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div ref={problemRef} style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
              color: '#F5A800', textTransform: 'uppercase', margin: '0 0 14px',
              opacity: problemInView ? 1 : 0,
              transform: problemInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>The Struggle Is Real</p>
            <h2 style={{
              fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0,
              opacity: problemInView ? 1 : 0,
              transform: problemInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}>
              Sound familiar?
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
          }}>
            {[
              {
                icon: BookOpen, color: '#f87171', bg: 'rgba(248,113,113,0.1)',
                title: 'Drowning in information',
                desc: 'Too many tabs, PDFs, and notes — but none of it sticking. The more you read, the more lost you feel.',
              },
              {
                icon: Clock, color: '#fb923c', bg: 'rgba(251,146,60,0.1)',
                title: 'Focus keeps slipping',
                desc: 'You sit down to study and an hour later you\'ve barely done anything. Distractions win every time.',
              },
              {
                icon: FileText, color: '#c084fc', bg: 'rgba(192,132,252,0.1)',
                title: 'The blank page nightmare',
                desc: 'Reports and assignments pile up while you stare at an empty document, unsure where to start.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }, i) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 18, padding: '28px 24px',
                opacity: problemInView ? 1 : 0,
                transform: problemInView ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.5s ease ${0.18 + i * 0.1}s, transform 0.5s ease ${0.18 + i * 0.1}s`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 16,
                }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                  {title}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution section ───────────────────────────────── */}
      <section id="solution" style={{ padding: '72px 24px 88px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div ref={solutionRef} style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
              color: '#F5A800', textTransform: 'uppercase', margin: '0 0 14px',
              opacity: solutionInView ? 1 : 0,
              transform: solutionInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>The Prime Way</p>
            <h2 style={{
              fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0,
              opacity: solutionInView ? 1 : 0,
              transform: solutionInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}>
              One app that solves all of it
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                icon: MessageCircle, color: '#F5A800', bg: 'rgba(245,168,0,0.1)',
                title: 'AI that actually understands you',
                desc: 'StudyPal knows your subject and your level. It doesn\'t just answer — it explains in a way that makes sense for you.',
              },
              {
                icon: Timer, color: '#34d399', bg: 'rgba(52,211,153,0.1)',
                title: 'Science-backed focus sessions',
                desc: 'Pomodoro timers and streak tracking keep you in the zone. Every session adds to a streak that keeps you accountable.',
              },
              {
                icon: FileText, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',
                title: 'Reports that practically write themselves',
                desc: 'Type your rough draft and let Prime polish it into a professional academic report in seconds.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }, i) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${bg.replace('0.1)', '0.22)')}`,
                borderRadius: 20, padding: '30px 26px',
                opacity: solutionInView ? 1 : 0,
                transform: solutionInView ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.5s ease ${0.2 + i * 0.12}s, transform 0.5s ease ${0.2 + i * 0.12}s`,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 18,
                }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  {title}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features section ───────────────────────────────── */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div ref={featRef} style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
              color: '#F5A800', textTransform: 'uppercase', margin: '0 0 14px',
              opacity: featInView ? 1 : 0,
              transform: featInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>Features</p>
            <h2 style={{
              fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0,
              opacity: featInView ? 1 : 0,
              transform: featInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}>
              Everything you need to excel
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 14,
          }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} inView={featInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing section ────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 24px 100px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div ref={priceRef} style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
              color: '#F5A800', textTransform: 'uppercase', margin: '0 0 14px',
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>Pricing</p>
            <h2 style={{
              fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0,
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}>
              Simple, student-friendly pricing
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: 20, alignItems: 'start',
          }}>
            {/* Free */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 22, padding: 30,
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'translateY(0)' : 'translateY(44px)',
              transition: 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s',
            }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Free</span>
              </div>
              <div style={{ marginBottom: 22 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>$0</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginLeft: 5 }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 26px', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {FREE_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                    <Check size={13} style={{ color: '#34d399', flexShrink: 0, marginTop: 1 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" style={{
                display: 'block', textAlign: 'center',
                padding: '12px 0', borderRadius: 11,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14,
                textDecoration: 'none', transition: 'background 0.18s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              >
                Get Started Free
              </Link>
            </div>

            {/* Basic */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 22, padding: 30,
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'translateY(0)' : 'translateY(44px)',
              transition: 'opacity 0.55s ease 0.22s, transform 0.55s ease 0.22s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Star size={16} style={{ color: '#F5A800' }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>Basic</span>
              </div>
              <div style={{ marginBottom: 22 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>2,500</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginLeft: 5 }}>FCFA/mo</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 26px', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {BASIC_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    <Check size={13} style={{ color: '#34d399', flexShrink: 0, marginTop: 1 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" style={{
                display: 'block', textAlign: 'center',
                padding: '12px 0', borderRadius: 11,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                color: 'rgba(255,255,255,0.78)', fontWeight: 600, fontSize: 14,
                textDecoration: 'none', transition: 'background 0.18s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                Get Basic
              </Link>
            </div>

            {/* Pro */}
            <div className="lp-pro-glow" style={{
              background: 'rgba(245,168,0,0.06)',
              borderRadius: 22, padding: 30,
              position: 'relative', overflow: 'hidden',
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'translateY(0)' : 'translateY(44px)',
              transition: 'opacity 0.55s ease 0.36s, transform 0.55s ease 0.36s',
            }}>
              <div style={{
                position: 'absolute', top: 18, right: 18,
                background: '#F5A800', color: '#1a0c00',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.6px',
                padding: '3px 10px', borderRadius: 999,
              }}>POPULAR</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Zap size={16} style={{ color: '#F5A800' }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>Pro</span>
              </div>
              <div style={{ marginBottom: 22 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>5,000</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginLeft: 5 }}>FCFA/mo</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 26px', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {PRO_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                    <Check size={13} style={{ color: '#F5A800', flexShrink: 0, marginTop: 1 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" style={{
                display: 'block', textAlign: 'center',
                padding: '12px 0', borderRadius: 11,
                background: '#F5A800', color: '#1a0c00',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.87'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ section ────────────────────────────────────── */}
      <section id="faq" style={{ padding: '80px 24px 88px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div ref={faqRef} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800,
              letterSpacing: '-0.8px', margin: 0,
              opacity: faqInView ? 1 : 0,
              transform: faqInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>
              Common questions
            </h2>
          </div>

          <div style={{
            opacity: faqInView ? 1 : 0,
            transform: faqInView ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s ease 0.12s, transform 0.5s ease 0.12s',
          }}>
            {FAQS.map((item, i) => (
              <FaqItem
                key={i}
                item={item}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA section ──────────────────────────────── */}
      <section style={{ padding: '80px 24px 100px' }}>
        <div ref={ctaRef} style={{
          maxWidth: 680, margin: '0 auto', textAlign: 'center',
          background: 'rgba(245,168,0,0.05)',
          border: '1px solid rgba(245,168,0,0.18)',
          borderRadius: 28, padding: '56px 32px',
          opacity: ctaInView ? 1 : 0,
          transform: ctaInView ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: 800,
            letterSpacing: '-1px', margin: '0 0 18px',
          }}>
            Your best grades start here.
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.72,
            maxWidth: 440, margin: '0 auto 36px',
          }}>
            Stop grinding alone. Let Prime help you study smarter, stay focused, and actually understand what you're learning.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="lp-cta-shimmer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 30px', borderRadius: 12,
              background: '#F5A800', color: '#1a0c00',
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}>
              Start for Free Today <ChevronRight size={16} />
            </Link>
            <a href="#pricing" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '14px 26px', borderRadius: 12,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.72)', fontWeight: 600, fontSize: 15,
              textDecoration: 'none', transition: 'background 0.18s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 24px',
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="Prime"
            style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'contain' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>Prime</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
          © 2025 Prime. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Contact', href: '#' },
            { label: 'Blog', href: '#' },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              fontSize: 12, color: 'rgba(255,255,255,0.28)',
              textDecoration: 'none', transition: 'color 0.18s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
            >{label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
