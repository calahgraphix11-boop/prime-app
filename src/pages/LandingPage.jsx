import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const GOLD = "#F5A623";
const DARK_BG = "#0a1f0a";
const CARD_BG = "#112211";
const CARD_BORDER = "#1e3a1e";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Navbar({ navigate }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2rem", height: "64px",
      background: "rgba(10,31,10,0.85)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1a2e1a",
      animation: "navSlide 0.5s cubic-bezier(.4,0,.2,1) both"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: GOLD, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 16, color: "#000"
        }}>P</div>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>Prime</span>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button onClick={() => navigate("/login")} style={{
          background: "none", border: "1px solid #2a4a2a", color: "#ccc",
          padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14,
          fontFamily: "DM Sans, sans-serif"
        }}>Sign In</button>
        <button onClick={() => navigate("/login")} style={{
          background: GOLD, border: "none", color: "#000",
          padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14,
          fontWeight: 600, fontFamily: "DM Sans, sans-serif"
        }}>Get Started</button>
      </div>
    </nav>
  );
}

function MockupCard() {
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
      borderRadius: 16, padding: "1.25rem", width: "100%", maxWidth: 340,
      animation: "float 4s ease-in-out infinite",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5)"
    }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["#ff5f57","#febc2e","#28c840"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 36, fontWeight: 700, color: "#fff", letterSpacing: 2 }}>24:37</div>
        <div style={{ fontSize: 11, color: "#6b9b6b", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>Studying</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Calculus Review</div>
      </div>
      <button style={{
        width: "100%", background: GOLD, border: "none", color: "#000",
        padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 600,
        cursor: "pointer", marginBottom: 12, fontFamily: "DM Sans, sans-serif"
      }}>Explain L'Hôpital's rule simply</button>
      <div style={{
        background: "#0d1a0d", borderRadius: 8, padding: "10px 12px",
        fontSize: 12, color: "#bbb", lineHeight: 1.5, marginBottom: 12
      }}>
        When you get 0/0 or ∞/∞, differentiate the top and bottom separately — then re-evaluate.
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#0d2a0d", borderRadius: 20, padding: "4px 12px",
        fontSize: 11, color: "#4caf50"
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50" }} />
        StudyPal active
      </div>
    </div>
  );
}

function Hero({ navigate }) {
  const words = ["Study", "Smarter.", "Compete", "Harder.", "Graduate", "Stronger."];
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "100px 2rem 60px", maxWidth: 1100, margin: "0 auto",
      gap: "3rem", background: "red"
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#1a2e1a", border: "1px solid #2a4a2a",
          borderRadius: 20, padding: "6px 14px", marginBottom: "1.5rem",
          animation: "fadeUp 0.6s ease both"
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
          <span style={{ fontSize: 12, color: "#aaa", fontFamily: "DM Sans, sans-serif" }}>AI-powered study companion</span>
        </div>

        <h1 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.15,
          color: "#fff", margin: "0 0 1.25rem"
        }}>
          {words.map((w, i) => (
            <span key={i} style={{
              display: "inline-block", marginRight: "0.25em",
              animation: `wordReveal 0.5s ease both`,
              animationDelay: `${0.1 + i * 0.1}s`,
              color: w.includes(".") && i % 2 !== 0 ? GOLD : "#fff"
            }}>{w}</span>
          ))}
        </h1>

        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "#8a9e8a",
          lineHeight: 1.7, maxWidth: 460, marginBottom: "2rem",
          animation: "fadeUp 0.6s ease 0.7s both"
        }}>
          Prime gives university students in Cameroon AI-powered tools to study, track progress, and stay motivated — all in one place.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem", animation: "fadeUp 0.6s ease 0.85s both" }}>
          <button onClick={() => navigate("/login")} style={{
            background: GOLD, border: "none", color: "#000",
            padding: "12px 28px", borderRadius: 10, fontSize: 15,
            fontWeight: 700, cursor: "pointer", fontFamily: "DM Sans, sans-serif",
            display: "flex", alignItems: "center", gap: 8, position: "relative", overflow: "hidden"
          }}>
            Start for free <span>→</span>
            <span style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              animation: "shimmer 2.5s infinite", backgroundSize: "200% 100%"
            }} />
          </button>
          <button onClick={() => navigate("#pricing")} style={{
            background: "none", border: "1px solid #2a4a2a", color: "#ccc",
            padding: "12px 28px", borderRadius: 10, fontSize: 15,
            cursor: "pointer", fontFamily: "DM Sans, sans-serif"
          }}>See pricing</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, animation: "fadeUp 0.6s ease 1s both" }}>
          <div style={{ display: "flex" }}>
            {["#e91e63","#9c27b0","#2196f3","#4caf50"].map((c, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: "50%", background: c,
                border: "2px solid " + DARK_BG, marginLeft: i > 0 ? -8 : 0
              }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: "#6b9b6b", fontFamily: "DM Sans, sans-serif" }}>
            Trusted by <strong style={{ color: "#aaa" }}>students</strong> across Cameroon
          </span>
        </div>
      </div>

      <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", animation: "fadeUp 0.6s ease 0.4s both" }}>
        <MockupCard />
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: "💬", title: "AI Study Chat", desc: "Ask anything mid-session. Get instant, contextual explanations powered by AI — without leaving your timer." },
  { icon: "⏱", title: "Focus Timer", desc: "Pomodoro and free-form sessions with circular progress. Every minute tracked toward your weekly goal." },
  { icon: "✍️", title: "Report Writer", desc: "Rewrite and polish academic writing in any tone — formal, casual, or technical — in one click." },
  { icon: "📝", title: "Note Summarizer", desc: "Paste lecture notes or readings and get a crisp summary with key points extracted automatically." },
  { icon: "🎯", title: "Exam Coach", desc: "Upload study material and receive practice questions, flashcards, and targeted exam strategies." },
  { icon: "🏆", title: "Leaderboard", desc: "Compete with friends on weekly study minutes. Track your streak and climb the rankings." },
];

function Features() {
  const [ref, visible] = useInView();
  return (
    <section id="features" ref={ref} style={{ padding: "80px 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: "DM Sans, sans-serif", marginBottom: 12 }}>
          EVERYTHING IN ONE PLACE
        </div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
          Built for how students actually study
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
            borderRadius: 14, padding: "1.25rem",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`
          }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 15, color: "#fff", marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#6b9b6b", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing({ navigate }) {
  const [ref, visible] = useInView();
  const plans = [
    {
      name: "Basic", price: "2,500", currency: "FCFA/mo", popular: false,
      features: ["Unlimited AI chat sessions", "Focus timer + Pomodoro mode", "AI report rewriter (20/day)", "Leaderboard access"],
      cta: "Get Basic"
    },
    {
      name: "Pro", price: "5,000", currency: "FCFA/mo", popular: true,
      features: ["Everything in Basic", "Unlimited report rewrites", "Note Summarizer + Exam Coach", "Unlimited file uploads", "Priority support"],
      cta: "Get Pro"
    }
  ];
  return (
    <section id="pricing" ref={ref} style={{ padding: "80px 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: "DM Sans, sans-serif", marginBottom: 12 }}>
          SIMPLE PRICING
        </div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
          Affordable for every student
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", maxWidth: 700, margin: "0 auto" }}>
        {plans.map((p, i) => (
          <div key={i} style={{
            background: CARD_BG,
            border: p.popular ? `2px solid ${GOLD}` : `1px solid ${CARD_BORDER}`,
            borderRadius: 16, padding: "1.75rem", position: "relative",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
            animation: p.popular && visible ? "glowPulse 2.5s ease-in-out infinite" : "none"
          }}>
            {p.popular && (
              <div style={{
                position: "absolute", top: -12, right: 16,
                background: GOLD, color: "#000", fontSize: 11, fontWeight: 700,
                padding: "3px 12px", borderRadius: 20, fontFamily: "DM Sans, sans-serif"
              }}>POPULAR</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{p.popular ? "⚡" : "⭐"}</span>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 16, color: "#fff" }}>{p.name}</span>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={{ fontFamily: "Syne, sans-serif", fontSize: 36, fontWeight: 800, color: "#fff" }}>{p.price}</span>
              <span style={{ fontSize: 13, color: "#6b9b6b", marginLeft: 4, fontFamily: "DM Sans, sans-serif" }}>{p.currency}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: 8 }}>
              {p.features.map((f, j) => (
                <li key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#aaa", fontFamily: "DM Sans, sans-serif" }}>
                  <span style={{ color: GOLD, fontSize: 12 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/login")} style={{
              width: "100%", background: p.popular ? GOLD : "#1a2e1a",
              border: p.popular ? "none" : `1px solid ${CARD_BORDER}`,
              color: p.popular ? "#000" : "#ccc",
              padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "DM Sans, sans-serif"
            }}>{p.cta}</button>
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  { q: "How is Prime different from just using ChatGPT?", a: "Prime is built specifically for students — it combines AI chat with a Pomodoro timer, progress analytics, streak tracking, and a dedicated report writer. It's a complete study system, not just a chatbot." },
  { q: "What subjects does Prime support?", a: "All of them. Maths, Sciences, History, Literature, Languages, Economics, Computer Science — if you can study it, Prime can help." },
  { q: "Is my data private and secure?", a: "Yes. Your conversations and study data are encrypted and never sold to third parties." },
  { q: "Can I cancel my subscription anytime?", a: "Completely. No lock-in, no cancellation fees. Cancel from settings and you keep access until the end of your billing period." },
  { q: "Does Prime work on mobile?", a: "Yes — Prime is fully responsive on desktop, tablet, and mobile. A native app is on the roadmap." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  const [ref, visible] = useInView();
  return (
    <section id="faq" ref={ref} style={{ padding: "80px 2rem", maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: "2.5rem" }}>
        Common questions
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {FAQS.map((f, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
            borderRadius: 12, padding: "1rem 1.25rem", cursor: "pointer",
            opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.06}s`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#fff", fontWeight: 500 }}>{f.q}</span>
              <span style={{ color: GOLD, fontSize: 18, transform: open === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
            </div>
            {open === i && (
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#6b9b6b", marginTop: 10, marginBottom: 0, lineHeight: 1.6 }}>{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: DARK_BG, minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes navSlide { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wordReveal { from { opacity: 0; transform: translateY(12px) blur(4px); } to { opacity: 1; transform: translateY(0) blur(0); } }
        @keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(0.5deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.2); } 50% { box-shadow: 0 0 24px 4px rgba(245,166,35,0.25); } }
        @media (max-width: 700px) {
          section > div:first-child { flex-direction: column !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
      `}</style>

      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <Features />
      <Pricing navigate={navigate} />
      <FAQ />

      <footer style={{
        borderTop: `1px solid ${CARD_BORDER}`, padding: "1.5rem 2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1100, margin: "0 auto", flexWrap: "wrap", gap: "1rem"
      }}>
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#4a6b4a" }}>
          © 2025 Prime. Study smart.
        </span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy", "Terms"].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: "#4a6b4a", textDecoration: "none", fontFamily: "DM Sans, sans-serif" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
