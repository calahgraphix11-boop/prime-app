import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Timer, FileText, BookOpen,
  Zap, Trophy, ChevronRight, Check,
} from 'lucide-react';

const H = { fontFamily: "'Syne', sans-serif" };
const B = { fontFamily: "'DM Sans', sans-serif" };

// ── useInView ─────────────────────────────────────────────────

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

// ── HeroMockup ────────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="lp-float" style={{ position: 'relative', width: 300, flexShrink: 0 }}>
      {/* ambient glow */}
      <div style={{
        position: 'absolute', inset: -48,
        background: 'radial-gradient(ellipse at 50% 52%, rgba(245,168,0,0.13) 0%, transparent 64%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        background: 'rgba(0,12,6,0.92)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(245,168,0,0.16)',
        borderRadius: 24,
        padding: '20px 18px',
        boxShadow: '0 36px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {/* window dots */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.6 }} />
          ))}
        </div>

        {/* timer block */}
        <div style={{
          background: 'rgba(245,168,0,0.07)',
          border: '1px solid rgba(245,168,0,0.14)',
          borderRadius: 14, padding: '14px 16px',
          textAlign: 'center', marginBottom: 14,
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 34, fontWeight: 700, color: '#fff', letterSpacing: 3, lineHeight: 1 }}>
            24:37
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)', marginTop: 4, letterSpacing: '1.5px', ...B }}>STUDYING</div>
          <div style={{ marginTop: 10 }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(245,168,0,0.15)', border: '1px solid rgba(245,168,0,0.3)',
              borderRadius: 999, padding: '3px 12px',
              fontSize: 11, color: '#F5A800', fontWeight: 600, ...B,
            }}>Calculus Review</span>
          </div>
        </div>

        {/* chat bubble */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            alignSelf: 'flex-end',
            background: '#F5A800', color: '#111',
            borderRadius: '12px 12px 3px 12px',
            padding: '7px 12px',
            fontSize: 11, fontWeight: 500, lineHeight: 1.45, ...B,
            marginBottom: 7,
          }}>
            Explain L'Hôpital's rule simply
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.75)',
            borderRadius: '12px 12px 12px 3px',
            padding: '7px 12px',
            fontSize: 11, lineHeight: 1.5, ...B,
          }}>
            When you get 0/0 or ∞/∞, differentiate top and bottom separately…
          </div>
        </div>

        {/* status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.16)',
          borderRadius: 8, padding: '5px 10px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
          <span style={{ fontSize: 10, color: '#34d399', fontWeight: 600, ...B }}>StudyPal active</span>
        </div>
      </div>
    </div>
  );
}

// ── Feature cards ─────────────────────────────────────────────

const FEATURES = [
  {
    icon: MessageCircle, color: '#F5A800',
    bg: 'rgba(245,168,0,0.08)', border: 'rgba(245,168,0,0.15)',
    title: 'AI Study Chat',
    desc: 'Ask anything mid-session and get instant contextual explanations — without leaving your timer.',
  },
  {
    icon: Timer, color: '#34d399',
    bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.13)',
    title: 'Focus Timer',
    desc: 'Pomodoro and free-form sessions with circular progress. Every minute tracked toward your weekly goal.',
  },
  {
    icon: FileText, color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.13)',
    title: 'Report Writer',
    desc: 'Turn rough drafts into polished academic reports in any tone, in seconds.',
  },
  {
    icon: BookOpen, color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.13)',
    title: 'Note Summarizer',
    desc: 'Paste lecture notes and get a crisp summary with key points extracted automatically.',
  },
  {
    icon: Zap, color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.13)',
    title: 'Exam Coach',
    desc: 'Upload your material and receive targeted practice questions and exam strategies.',
  },
  {
    icon: Trophy, color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.13)',
    title: 'Leaderboard',
    desc: 'Compete with friends on weekly study minutes and climb the rankings.',
  },
];

// ── Pricing data ──────────────────────────────────────────────

const BASIC_FEATS = [
  'Unlimited AI chat sessions',
  'Focus timer + Pomodoro mode',
  'AI report rewriter (20/day)',
  'Leaderboard access',
];
const PRO_FEATS = [
  'Everything in Basic',
  'Unlimited report rewrites',
  'Note Summarizer + Exam Coach',
  'Unlimited file uploads',
  'Priority support',
];

// ── Headline words ────────────────────────────────────────────

const WORDS = ['Study', 'Smarter.', 'Compete', 'Harder.', 'Graduate', 'Stronger.'];

// ── LandingPage ───────────────────────────────────────────────

export default function LandingPage() {
  const parallaxRef = useRef(null);
  const [navReady, setNavReady] = useState(false);
  const [featRef,  featInView]  = useInView(0.07);
  const [priceRef, priceInView] = useInView(0.07);

  useEffect(() => {
    const id = setTimeout(() => setNavReady(true), 55);
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
    <div style={{ background: '#001a10', minHeight: '100vh', overflowX: 'hidden', color: '#fff', ...B }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: navReady ? 'rgba(0,16,8,0.76)' : 'transparent',
        backdropFilter: navReady ? 'blur(22px)' : 'none',
        WebkitBackdropFilter: navReady ? 'blur(22px)' : 'none',
        borderBottom: navReady ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transform: navReady ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.52s cubic-bezier(0.22,1,0.36,1), background 0.4s, border-color 0.4s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="calah.ai" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px', ...H }}>calah.ai</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.58)', textDecoration: 'none', transition: 'color 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.58)'; }}
          >Sign In</Link>
          <Link to="/signup" className="lp-cta-shimmer" style={{
            padding: '7px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            background: '#F5A800', color: '#1a0c00', textDecoration: 'none',
            transition: 'opacity 0.15s', ...H,
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 60,
      }}>
        {/* parallax bg */}
        <div ref={parallaxRef} style={{
          position: 'absolute', inset: '-12% -5%',
          background: 'radial-gradient(ellipse 80% 55% at 55% 40%, rgba(0,72,44,0.58) 0%, rgba(0,32,20,0.24) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{
          maxWidth: 1080, margin: '0 auto', width: '100%',
          padding: '100px 32px 112px',
          display: 'flex', alignItems: 'center',
          gap: 72, flexWrap: 'wrap', justifyContent: 'space-between',
        }}>

          {/* ── Left: text ── */}
          <div style={{ flex: '1 1 400px', maxWidth: 520 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,168,0,0.09)', border: '1px solid rgba(245,168,0,0.22)',
              borderRadius: 999, padding: '5px 14px', marginBottom: 30,
              opacity: 0, animation: 'lp-fade-up 0.5s ease 0.08s forwards',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A800' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#F5A800', letterSpacing: '0.3px', ...B }}>
                AI-powered study companion
              </span>
            </div>

            {/* Headline — word by word */}
            <h1 style={{
              fontSize: 'clamp(36px, 5.5vw, 60px)',
              fontWeight: 800, lineHeight: 1.08,
              letterSpacing: '-2px', margin: '0 0 22px', ...H,
            }}>
              {WORDS.map((word, i) => (
                <span key={i} style={{
                  display: 'inline-block', marginRight: '0.22em',
                  color: word === 'Stronger.' ? '#F5A800' : '#fff',
                  opacity: 0,
                  animation: `lp-word-reveal 0.55s cubic-bezier(0.22,1,0.36,1) ${0.26 + i * 0.11}s forwards`,
                }}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.46)', lineHeight: 1.75,
              maxWidth: 440, margin: '0 0 34px',
              opacity: 0, animation: 'lp-fade-up 0.52s ease 0.98s forwards',
            }}>
              Calah gives university students in Cameroon AI-powered tools to study, track progress, and stay motivated — all in one place.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
              opacity: 0, animation: 'lp-fade-up 0.5s ease 1.1s forwards',
            }}>
              <Link to="/signup" className="lp-cta-shimmer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '12px 26px', borderRadius: 11,
                background: '#F5A800', color: '#1a0c00',
                fontWeight: 700, fontSize: 14, textDecoration: 'none', ...H,
              }}>
                Start for free <ChevronRight size={15} />
              </Link>
              <a href="#pricing" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '12px 22px', borderRadius: 11,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.68)', fontWeight: 500, fontSize: 14,
                textDecoration: 'none', transition: 'background 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              >
                See pricing
              </a>
            </div>

            {/* Avatar row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 11, marginTop: 32,
              opacity: 0, animation: 'lp-fade-up 0.5s ease 1.22s forwards',
            }}>
              <div style={{ display: 'flex' }}>
                {[['#2d6a4f','A'],['#40916c','K'],['#52b788','M'],['#74c69d','S']].map(([bg, letter], i) => (
                  <div key={letter} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: bg, border: '2px solid #001a10',
                    marginLeft: i > 0 ? -8 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.65)',
                  }}>
                    {letter}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', ...B }}>
                Trusted by&nbsp;
                <strong style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>students</strong>
                &nbsp;across Cameroon
              </span>
            </div>
          </div>

          {/* ── Right: mockup ── */}
          <div style={{
            flex: '0 0 auto',
            opacity: 0, animation: 'lp-fade-up 0.6s ease 0.55s forwards',
          }}>
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section style={{ padding: '96px 32px 80px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {/* Centered header */}
          <div ref={featRef} style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '2.8px',
              color: '#F5A800', textTransform: 'uppercase', margin: '0 0 14px', ...B,
              opacity: featInView ? 1 : 0,
              transform: featInView ? 'none' : 'translateY(14px)',
              transition: 'opacity 0.48s ease, transform 0.48s ease',
            }}>
              Everything in one place
            </p>
            <h2 style={{
              fontSize: 'clamp(24px, 3.6vw, 40px)', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0, ...H,
              opacity: featInView ? 1 : 0,
              transform: featInView ? 'none' : 'translateY(14px)',
              transition: 'opacity 0.48s ease 0.08s, transform 0.48s ease 0.08s',
            }}>
              Built for how students actually study
            </h2>
          </div>

          {/* 3×2 grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 12,
          }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${f.border}`,
                  borderRadius: 18, padding: '24px 20px',
                  opacity: featInView ? 1 : 0,
                  transform: featInView ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.48s ease ${0.1 + i * 0.06}s, transform 0.48s ease ${0.1 + i * 0.06}s`,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: f.bg, border: `1px solid ${f.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={18} style={{ color: f.color }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 7, ...H }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.68, ...B }}>
                    {f.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 32px 104px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          {/* Centered header */}
          <div ref={priceRef} style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '2.8px',
              color: '#F5A800', textTransform: 'uppercase', margin: '0 0 14px', ...B,
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'none' : 'translateY(14px)',
              transition: 'opacity 0.48s ease, transform 0.48s ease',
            }}>
              Simple pricing
            </p>
            <h2 style={{
              fontSize: 'clamp(24px, 3.6vw, 40px)', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0, ...H,
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'none' : 'translateY(14px)',
              transition: 'opacity 0.48s ease 0.08s, transform 0.48s ease 0.08s',
            }}>
              Affordable for every student
            </h2>
          </div>

          {/* 2 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>

            {/* Basic */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 22, padding: '30px 28px',
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 0.5s ease 0.16s, transform 0.5s ease 0.16s',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, ...H }}>Basic</div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 38, fontWeight: 800, ...H }}>2,500</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.34)', marginLeft: 5, ...B }}>FCFA/mo</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 26px', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {BASIC_FEATS.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.55)', ...B }}>
                    <Check size={12} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" style={{
                display: 'block', textAlign: 'center',
                padding: '11px 0', borderRadius: 11, fontSize: 13, fontWeight: 700,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'background 0.18s',
                ...H,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              >
                Get Basic
              </Link>
            </div>

            {/* Pro */}
            <div className="lp-pro-glow" style={{
              background: 'rgba(245,168,0,0.05)',
              borderRadius: 22, padding: '30px 28px',
              position: 'relative', overflow: 'hidden',
              opacity: priceInView ? 1 : 0,
              transform: priceInView ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 0.5s ease 0.28s, transform 0.5s ease 0.28s',
            }}>
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: '#F5A800', color: '#1a0c00',
                fontSize: 9, fontWeight: 800, letterSpacing: '0.7px',
                padding: '3px 9px', borderRadius: 999, ...B,
              }}>POPULAR</div>

              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, ...H }}>Pro</div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 38, fontWeight: 800, ...H }}>5,000</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.34)', marginLeft: 5, ...B }}>FCFA/mo</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 26px', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {PRO_FEATS.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.72)', ...B }}>
                    <Check size={12} style={{ color: '#F5A800', flexShrink: 0, marginTop: 2 }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" style={{
                display: 'block', textAlign: 'center',
                padding: '11px 0', borderRadius: 11, fontSize: 13, fontWeight: 700,
                background: '#F5A800', color: '#1a0c00', textDecoration: 'none',
                transition: 'opacity 0.15s', ...H,
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Get Pro
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '22px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
        maxWidth: 1080, margin: '0 auto',
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0, ...B }}>
          calah.ai · © 2025 calah.ai. Study smart.
        </p>
        <div style={{ display: 'flex', gap: 18 }}>
          {['Privacy', 'Terms'].map(l => (
            <a key={l} href="#" style={{
              fontSize: 12, color: 'rgba(255,255,255,0.25)',
              textDecoration: 'none', transition: 'color 0.18s', ...B,
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
            >{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}
