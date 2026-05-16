import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Timer, FileText, BookOpen,
  Zap, Trophy, ChevronRight, Check, Star,
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
      {/* ambient glow */}
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
        {/* window chrome */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
          {['#ff5f57','#febc2e','#28c840'].map((c) => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>

        {/* timer display */}
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

        {/* chat bubbles */}
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

        {/* active badge */}
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
    icon: MessageCircle,
    color: '#F5A800',
    bg: 'rgba(245,168,0,0.1)',
    border: 'rgba(245,168,0,0.18)',
    title: 'AI Study Chat',
    desc: 'Ask anything mid-session. Get instant, contextual explanations powered by Gemini — without leaving your timer.',
  },
  {
    icon: Timer,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.15)',
    title: 'Focus Timer',
    desc: 'Pomodoro and free-form sessions with circular progress. Every minute tracked toward your weekly goal.',
  },
  {
    icon: FileText,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    border: 'rgba(167,139,250,0.15)',
    title: 'Report Writer',
    desc: 'Rewrite and polish academic writing in any tone — formal, casual, or technical — in one click.',
  },
  {
    icon: BookOpen,
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.15)',
    title: 'Note Summarizer',
    desc: 'Paste lecture notes or readings and get a crisp summary with key points extracted automatically.',
  },
  {
    icon: Zap,
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.1)',
    border: 'rgba(244,114,182,0.15)',
    title: 'Exam Coach',
    desc: 'Upload study material and receive practice questions, flashcards, and targeted exam strategies.',
  },
  {
    icon: Trophy,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.15)',
    title: 'Leaderboard',
    desc: 'Compete with friends on weekly study minutes. Track your streak and climb the rankings.',
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
        transition: `opacity 0.52s ease ${index * 0.07}s, transform 0.52s ease ${index * 0.07}s`,
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

// ── Landing page ─────────────────────────────────────────────

const HEADLINE = ['Study', 'Smarter.', 'Score', 'Higher.'];

const BASIC_FEATURES = [
  'Unlimited AI chat sessions',
  'Focus timer + Pomodoro mode',
  'AI report rewriter (20/day)',
  'Leaderboard access',
];
const PRO_FEATURES = [
  'Everything in Basic',
  'Unlimited report rewrites',
  'Note Summarizer + Exam Coach',
  'Unlimited file uploads',
  'Priority support',
];

export default function LandingPage() {
  const parallaxRef = useRef(null);
  const [navReady, setNavReady] = useState(false);
  const [featRef, featInView] = useInView(0.07);
  const [priceRef, priceInView] = useInView(0.08);

  // Navbar: tiny delay so the transition is visible from page load
  useEffect(() => { const id = setTimeout(() => setNavReady(true), 60); return () => clearTimeout(id); }, []);

  // Parallax hero bg
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
          <img src="/logo.png" alt="calah.ai"
            style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.4px' }}>calah.ai</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" style={{
            padding: '7px 14px', borderRadius: 9,
            color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'color 0.18s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
          >Sign in</Link>
          <Link to="/signup" style={{
            padding: '7px 18px', borderRadius: 9,
            background: '#F5A800', color: '#1a0c00',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.87'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >Get started</Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        paddingTop: 60,
      }}>
        {/* Parallax radial bg */}
        <div ref={parallaxRef} style={{
          position: 'absolute', inset: '-10% -5%',
          background: 'radial-gradient(ellipse 90% 65% at 50% 38%, rgba(0,80,48,0.65) 0%, rgba(0,40,24,0.32) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* subtle grid lines */}
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
            {/* pill badge */}
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
              fontSize: 'clamp(38px, 6.5vw, 66px)',
              fontWeight: 800, lineHeight: 1.08,
              letterSpacing: '-2px', margin: '0 0 26px',
            }}>
              {HEADLINE.map((word, i) => (
                <span key={word + i} style={{
                  display: 'inline-block',
                  marginRight: '0.24em',
                  color: (word === 'Higher.') ? '#F5A800' : '#fff',
                  opacity: 0,
                  animation: `lp-word-reveal 0.6s cubic-bezier(0.22,1,0.36,1) ${0.32 + i * 0.13}s forwards`,
                }}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Sub */}
            <p style={{
              fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.72,
              maxWidth: 430, margin: '0 0 34px',
              opacity: 0, animation: 'lp-fade-up 0.6s ease 0.88s forwards',
            }}>
              Calah combines AI chat, focus timers, report writing, and exam prep — everything you need to study with purpose and see your progress grow.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              opacity: 0, animation: 'lp-fade-up 0.55s ease 1.04s forwards',
            }}>
              <Link to="/signup" className="lp-cta-shimmer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 26px', borderRadius: 12,
                background: '#F5A800', color: '#1a0c00',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>
                Start for free <ChevronRight size={15} />
              </Link>
              <a href="#pricing" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '13px 24px', borderRadius: 12,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.78)', fontWeight: 600, fontSize: 14,
                textDecoration: 'none', transition: 'background 0.18s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              >
                See pricing
              </a>
            </div>

            {/* Social proof avatars */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginTop: 30,
              opacity: 0, animation: 'lp-fade-up 0.55s ease 1.18s forwards',
            }}>
              <div style={{ display: 'flex' }}>
                {['#2d6a4f','#40916c','#52b788','#74c69d'].map((bg, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: bg, border: '2px solid #001a10',
                    marginLeft: i > 0 ? -8 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)',
                  }}>
                    {['A', 'K', 'M', 'S'][i]}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                Trusted by&nbsp;
                <strong style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>students</strong>
                &nbsp;across Cameroon
              </span>
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

      {/* ── Features ──────────────────────────────────────── */}
      <section style={{ padding: '88px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div ref={featRef} style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
              color: '#F5A800', textTransform: 'uppercase', margin: '0 0 14px',
              opacity: featInView ? 1 : 0,
              transform: featInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>Everything in one place</p>
            <h2 style={{
              fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0,
              opacity: featInView ? 1 : 0,
              transform: featInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}>
              Built for how students actually study
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} inView={featInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 24px 100px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div ref={priceRef} style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
              color: '#F5A800', textTransform: 'uppercase', margin: '0 0 14px',
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>Simple pricing</p>
            <h2 style={{
              fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0,
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}>
              Affordable for every student
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 20,
          }}>
            {/* Basic */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 22, padding: 30,
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'translateY(0)' : 'translateY(44px)',
              transition: 'opacity 0.55s ease 0.18s, transform 0.55s ease 0.18s',
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
              transition: 'opacity 0.55s ease 0.32s, transform 0.55s ease 0.32s',
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

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="calah.ai"
            style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'contain' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>calah.ai</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
          © 2025 calah.ai · Study smart.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms'].map((l) => (
            <a key={l} href="#" style={{
              fontSize: 12, color: 'rgba(255,255,255,0.28)',
              textDecoration: 'none', transition: 'color 0.18s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
