import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Timer, FileText, BookOpen,
  Zap, Trophy, ChevronRight, ChevronDown, Check,
} from 'lucide-react';

// ── Fonts ─────────────────────────────────────────────────────
const HEADLINE = { fontFamily: "'Syne', sans-serif" };
const BODY     = { fontFamily: "'DM Sans', sans-serif" };

// ── Utilities ─────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
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
    if (!card || window.matchMedia('(max-width: 639px)').matches) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transition = 'transform 0.07s ease-out';
    card.style.transform  = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
  };
  const onMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.45s ease-out';
    ref.current.style.transform  = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
  };
  return { ref, onMouseMove, onMouseLeave };
}

// ── Hero mockup ───────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="lp-float" style={{ position: 'relative', width: 300 }}>
      {/* ambient glow */}
      <div style={{
        position: 'absolute', inset: -40,
        background: 'radial-gradient(ellipse at 50% 55%, rgba(245,168,0,0.14) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        background: 'rgba(0,14,7,0.90)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(245,168,0,0.18)',
        borderRadius: 24,
        padding: '20px 18px 18px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        {/* window dots */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.65 }} />
          ))}
        </div>
        {/* timer */}
        <div style={{
          background: 'rgba(245,168,0,0.07)',
          border: '1px solid rgba(245,168,0,0.16)',
          borderRadius: 14, padding: '12px 14px',
          textAlign: 'center', marginBottom: 12,
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 3 }}>
            24:37
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 3, letterSpacing: '1.5px' }}>STUDYING</div>
          <div style={{ fontSize: 11, color: '#F5A800', marginTop: 5, fontWeight: 600, ...BODY }}>Calculus Review</div>
        </div>
        {/* chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 11, lineHeight: 1.5, ...BODY }}>
          <div style={{
            alignSelf: 'flex-end',
            background: '#F5A800', color: '#111',
            borderRadius: '12px 12px 3px 12px',
            padding: '6px 11px', maxWidth: '88%', fontWeight: 500,
          }}>
            Explain L'Hôpital's rule simply
          </div>
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.78)',
            borderRadius: '12px 12px 12px 3px',
            padding: '6px 11px', maxWidth: '92%',
          }}>
            When you get 0/0 or ∞/∞, differentiate top and bottom separately…
          </div>
        </div>
        {/* active pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 11,
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)',
          borderRadius: 8, padding: '5px 9px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
          <span style={{ fontSize: 10, color: '#34d399', fontWeight: 600, ...BODY }}>StudyPal active</span>
        </div>
      </div>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────

const FEATURES = [
  {
    icon: MessageCircle, color: '#F5A800',
    bg: 'rgba(245,168,0,0.09)', border: 'rgba(245,168,0,0.16)',
    title: 'StudyPal Chatbot',
    desc: 'Ask anything mid-session and get instant, contextual explanations — without leaving your timer.',
  },
  {
    icon: Timer, color: '#34d399',
    bg: 'rgba(52,211,153,0.09)', border: 'rgba(52,211,153,0.14)',
    title: 'Focus Timer',
    desc: 'Pomodoro and free-form sessions with circular progress tracking and weekly goals.',
  },
  {
    icon: FileText, color: '#a78bfa',
    bg: 'rgba(167,139,250,0.09)', border: 'rgba(167,139,250,0.14)',
    title: 'AI Report Writer',
    desc: 'Turn rough drafts into polished academic reports in any tone, in seconds.',
  },
  {
    icon: BookOpen, color: '#60a5fa',
    bg: 'rgba(96,165,250,0.09)', border: 'rgba(96,165,250,0.14)',
    title: 'Note Summarizer',
    desc: 'Paste lecture notes and get a crisp summary with the key points pulled out automatically.',
  },
  {
    icon: Zap, color: '#f472b6',
    bg: 'rgba(244,114,182,0.09)', border: 'rgba(244,114,182,0.14)',
    title: 'Exam Coach',
    desc: 'Upload your material and receive targeted practice questions and exam strategies.',
  },
  {
    icon: Trophy, color: '#fbbf24',
    bg: 'rgba(251,191,36,0.09)', border: 'rgba(251,191,36,0.14)',
    title: 'Leaderboard',
    desc: 'Compete with friends on weekly study minutes and climb the rankings.',
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
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${feature.border}`,
        borderRadius: 20, padding: '26px 22px',
        cursor: 'default',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.5s ease ${index * 0.07}s, transform 0.5s ease ${index * 0.07}s`,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: feature.bg, border: `1px solid ${feature.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
      }}>
        <Icon size={19} style={{ color: feature.color }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8, ...HEADLINE }}>
        {feature.title}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.44)', lineHeight: 1.7, ...BODY }}>
        {feature.desc}
      </div>
    </div>
  );
}

// ── Pricing ───────────────────────────────────────────────────

const TIERS = [
  {
    name: 'Free', price: '$0', unit: '/mo',
    features: ['3 AI chats/day', '1 AI report/day', 'Basic Pomodoro', 'Study analytics'],
    cta: 'Get Started', ghost: true, delay: '0.1s',
  },
  {
    name: 'Basic', price: '2,500', unit: ' FCFA/mo',
    features: ['Unlimited AI chat', '10 AI reports/day', 'All features', 'Pomodoro', 'Streak tracking'],
    cta: 'Get Basic', ghost: true, delay: '0.22s',
  },
  {
    name: 'Pro', price: '5,000', unit: ' FCFA/mo',
    features: ['Unlimited everything', 'Smarter AI (Sonnet)', 'Priority support', 'Full analytics', 'Weekly progress reports'],
    cta: 'Get Pro', ghost: false, popular: true, delay: '0.36s',
  },
];

// ── FAQ ───────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How is Prime different from ChatGPT?',
    a: 'Prime is purpose-built for university students in Cameroon — combining an AI tutor, Pomodoro timer, report writer, streak tracking, and exam coaching in one focused app.',
  },
  {
    q: 'What subjects does Prime support?',
    a: 'All university subjects — Maths, Sciences, Literature, Law, Engineering, Medicine, and more, in both English and French.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Your study data and conversations belong to you. We never sell data to third parties, and everything is encrypted in transit and at rest.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely — no contracts, no lock-ins. Cancel from your account settings at any time.',
  },
  {
    q: 'Does Prime work on mobile?',
    a: 'Yes. Prime is fully responsive and works great on any smartphone or tablet browser.',
  },
];

// ── Section label ─────────────────────────────────────────────

function Label({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
      color: '#F5A800', textTransform: 'uppercase',
      margin: '0 0 14px', ...BODY,
    }}>
      {children}
    </p>
  );
}

// ── Hero headline words ────────────────────────────────────────

const WORDS = ['Study', 'Smarter.', 'Compete', 'Harder.', 'Graduate', 'Stronger.'];

// ── LandingPage ───────────────────────────────────────────────

export default function LandingPage() {
  const parallaxRef = useRef(null);
  const [navReady,   setNavReady]   = useState(false);
  const [openFaq,    setOpenFaq]    = useState(null);
  const [featRef,    featInView]    = useInView(0.06);
  const [priceRef,   priceInView]   = useInView(0.06);
  const [faqRef,     faqInView]     = useInView(0.08);

  useEffect(() => {
    const id = setTimeout(() => setNavReady(true), 60);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (parallaxRef.current)
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.28}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#001a10', minHeight: '100vh', overflowX: 'hidden', color: '#fff', ...BODY }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 62, padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: navReady ? 'rgba(0,16,8,0.72)' : 'transparent',
        backdropFilter: navReady ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: navReady ? 'blur(24px)' : 'none',
        borderBottom: navReady ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transform: navReady ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), background 0.4s, border-color 0.4s',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/logo.png" alt="Prime" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', ...HEADLINE }}>Prime</span>
        </div>

        {/* Nav links (desktop) */}
        <div style={{ display: 'flex', gap: 2 }}>
          {['Features', 'Pricing', 'FAQ'].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="lp-nav-link" style={{
              display: 'none', padding: '6px 13px', borderRadius: 8,
              color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.18s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >{l}</a>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login" style={{
            padding: '7px 15px', borderRadius: 9, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.18s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >Sign In</Link>
          <Link to="/signup" style={{
            padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700,
            background: '#F5A800', color: '#1a0c00', textDecoration: 'none',
            transition: 'opacity 0.15s', ...HEADLINE,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 62,
      }}>
        {/* Parallax radial bg */}
        <div ref={parallaxRef} style={{
          position: 'absolute', inset: '-12% -5%',
          background: 'radial-gradient(ellipse 85% 60% at 52% 40%, rgba(0,77,46,0.6) 0%, rgba(0,36,22,0.28) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* grid lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        <div style={{
          maxWidth: 1080, margin: '0 auto', width: '100%',
          padding: '80px 32px 96px',
          display: 'flex', alignItems: 'center', gap: 64,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>

          {/* Text */}
          <div style={{ flex: '1 1 420px', maxWidth: 540 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,168,0,0.09)', border: '1px solid rgba(245,168,0,0.24)',
              borderRadius: 999, padding: '5px 14px', marginBottom: 28,
              opacity: 0, animation: 'lp-fade-up 0.5s ease 0.1s forwards',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A800' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#F5A800', letterSpacing: '0.3px', ...BODY }}>
                AI-powered study companion
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(38px, 5.8vw, 64px)',
              fontWeight: 800, lineHeight: 1.07,
              letterSpacing: '-2.5px', margin: '0 0 24px',
              ...HEADLINE,
            }}>
              {WORDS.map((word, i) => (
                <span key={i} style={{
                  display: 'inline-block', marginRight: '0.22em',
                  color: word === 'Stronger.' ? '#F5A800' : '#fff',
                  opacity: 0,
                  animation: `lp-word-reveal 0.55s cubic-bezier(0.22,1,0.36,1) ${0.28 + i * 0.11}s forwards`,
                }}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.75,
              maxWidth: 440, margin: '0 0 36px',
              opacity: 0, animation: 'lp-fade-up 0.55s ease 1.0s forwards',
            }}>
              Prime gives university students in Cameroon AI-powered tools to study, track progress, and stay motivated — all in one place.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              opacity: 0, animation: 'lp-fade-up 0.5s ease 1.14s forwards',
            }}>
              <Link to="/signup" className="lp-cta-shimmer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '13px 28px', borderRadius: 12,
                background: '#F5A800', color: '#1a0c00',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                ...HEADLINE,
              }}>
                Start for Free <ChevronRight size={15} />
              </Link>
              <a href="#pricing" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '13px 24px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.13)',
                color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: 14,
                textDecoration: 'none', transition: 'background 0.18s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              >
                See Pricing
              </a>
            </div>

            {/* Trust line */}
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.28)',
              margin: '18px 0 0', letterSpacing: '0.1px',
              opacity: 0, animation: 'lp-fade-up 0.5s ease 1.26s forwards',
            }}>
              No credit card required · Free plan available · Cancel anytime
            </p>
          </div>

          {/* Mockup */}
          <div style={{
            flex: '0 0 auto',
            opacity: 0, animation: 'lp-fade-up 0.6s ease 0.6s forwards',
          }}>
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div ref={featRef} style={{ marginBottom: 56 }}>
            <div style={{
              opacity: featInView ? 1 : 0,
              transform: featInView ? 'none' : 'translateY(16px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>
              <Label>Features</Label>
              <h2 style={{
                fontSize: 'clamp(26px, 3.8vw, 42px)', fontWeight: 800,
                letterSpacing: '-1px', margin: 0, maxWidth: 400,
                ...HEADLINE,
              }}>
                Everything you need to excel
              </h2>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: 12,
          }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} inView={featInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div ref={priceRef} style={{ marginBottom: 52 }}>
            <div style={{
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'none' : 'translateY(16px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>
              <Label>Pricing</Label>
              <h2 style={{
                fontSize: 'clamp(26px, 3.8vw, 42px)', fontWeight: 800,
                letterSpacing: '-1px', margin: 0,
                ...HEADLINE,
              }}>
                Simple, student-friendly pricing
              </h2>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(275px, 1fr))',
            gap: 16, alignItems: 'start',
          }}>
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={tier.popular ? 'lp-pro-glow' : ''}
                style={{
                  background: tier.popular ? 'rgba(245,168,0,0.05)' : 'rgba(255,255,255,0.03)',
                  border: tier.popular ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 22, padding: '28px 26px',
                  position: 'relative', overflow: 'hidden',
                  opacity: priceInView ? 1 : 0,
                  transform: priceInView ? 'translateY(0)' : 'translateY(36px)',
                  transition: `opacity 0.5s ease ${tier.delay}, transform 0.5s ease ${tier.delay}`,
                }}
              >
                {tier.popular && (
                  <div style={{
                    position: 'absolute', top: 18, right: 18,
                    background: '#F5A800', color: '#1a0c00',
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.5px',
                    padding: '3px 9px', borderRadius: 999,
                    ...BODY,
                  }}>POPULAR</div>
                )}

                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, ...HEADLINE }}>
                  {tier.name}
                </div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, ...HEADLINE }}>{tier.price}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginLeft: 4, ...BODY }}>{tier.unit}</span>
                </div>

                <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.58)', ...BODY }}>
                      <Check size={13} style={{ color: tier.popular ? '#F5A800' : '#34d399', flexShrink: 0, marginTop: 1 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to="/signup" style={{
                  display: 'block', textAlign: 'center',
                  padding: '11px 0', borderRadius: 11, fontSize: 13, fontWeight: 700,
                  textDecoration: 'none', transition: tier.ghost ? 'background 0.18s' : 'opacity 0.15s',
                  background: tier.ghost ? 'rgba(255,255,255,0.07)' : '#F5A800',
                  border: tier.ghost ? '1px solid rgba(255,255,255,0.12)' : 'none',
                  color: tier.ghost ? 'rgba(255,255,255,0.7)' : '#1a0c00',
                  ...HEADLINE,
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = tier.ghost ? 'rgba(255,255,255,0.12)' : '#F5A800';
                    if (!tier.ghost) e.currentTarget.style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = tier.ghost ? 'rgba(255,255,255,0.07)' : '#F5A800';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '96px 32px 112px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div ref={faqRef} style={{ marginBottom: 48 }}>
            <div style={{
              opacity: faqInView ? 1 : 0,
              transform: faqInView ? 'none' : 'translateY(16px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>
              <Label>FAQ</Label>
              <h2 style={{
                fontSize: 'clamp(26px, 3.8vw, 40px)', fontWeight: 800,
                letterSpacing: '-1px', margin: 0,
                ...HEADLINE,
              }}>
                Common questions
              </h2>
            </div>
          </div>

          <div style={{
            opacity: faqInView ? 1 : 0,
            transform: faqInView ? 'none' : 'translateY(18px)',
            transition: 'opacity 0.5s ease 0.14s, transform 0.5s ease 0.14s',
          }}>
            {FAQS.map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 16,
                    padding: '20px 0', background: 'none', border: 'none',
                    color: '#fff', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, ...HEADLINE }}>{item.q}</span>
                  <ChevronDown size={17} style={{
                    color: '#F5A800', flexShrink: 0,
                    transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }} />
                </button>
                <div style={{
                  overflow: 'hidden',
                  maxHeight: openFaq === i ? 180 : 0,
                  transition: 'max-height 0.3s ease',
                }}>
                  <p style={{
                    fontSize: 14, color: 'rgba(255,255,255,0.48)',
                    lineHeight: 1.75, margin: '0 0 20px',
                    ...BODY,
                  }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 32px',
        maxWidth: 1080, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="Prime" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'contain' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', ...HEADLINE }}>Prime</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0, ...BODY }}>
          © 2025 Prime. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 22 }}>
          {['Privacy', 'Terms', 'Contact'].map((l) => (
            <a key={l} href="#" style={{
              fontSize: 12, color: 'rgba(255,255,255,0.26)',
              textDecoration: 'none', transition: 'color 0.18s',
              ...BODY,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.52)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.26)'; }}
            >{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}
