import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle, Timer, FileText, BookOpen, Target, BarChart2,
  Users, Trophy, Headphones, Smartphone
} from "lucide-react";

const GOLD = "#C9943A";
const DARK_BG = "#0a1f0a";
const CARD_BG = "#112211";
const CARD_BORDER = "#1e3a1e";
const F = "Inter, sans-serif";

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
      padding: "0 2.5rem", height: "64px",
      background: "rgba(10,31,10,0.9)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${CARD_BORDER}`,
      animation: "navSlide 0.5s cubic-bezier(.4,0,.2,1) both"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4caf50", flexShrink: 0 }} />
        <span style={{ fontFamily: F, fontWeight: 700, fontSize: 18, color: "#fff" }}>Prime</span>
      </div>
      <div className="nav-links" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {["Features", "Pricing", "FAQ"].map(link => (
          <a key={link} href={`#${link.toLowerCase()}`} style={{
            fontFamily: F, fontSize: 14, color: "rgba(255,255,255,0.65)",
            textDecoration: "none"
          }}>{link}</a>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button onClick={() => navigate("/login")} style={{
          background: "none", border: `1px solid ${CARD_BORDER}`, color: "#ccc",
          padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: F
        }}>Sign In</button>
        <button onClick={() => navigate("/login")} style={{
          background: GOLD, border: "none", color: "#000",
          padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14,
          fontWeight: 700, fontFamily: F
        }}>Get Started</button>
      </div>
    </nav>
  );
}

function Hero({ navigate }) {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "120px 2rem 80px", textAlign: "center",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
        width: 700, height: 700, pointerEvents: "none",
        background: `radial-gradient(circle, rgba(201,148,58,0.07) 0%, transparent 65%)`
      }} />

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "#1a2e1a", border: "1px solid #2a4a2a",
        borderRadius: 20, padding: "6px 14px", marginBottom: "1.75rem",
        animation: "fadeUp 0.6s ease both"
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
        <span style={{ fontSize: 12, color: "#aaa", fontFamily: F }}>AI-powered study companion for Cameroon</span>
      </div>

      <h1 style={{
        fontFamily: F, fontWeight: 800,
        fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.1,
        letterSpacing: "-0.03em", color: "#fff",
        margin: "0 0 1.5rem", maxWidth: 760,
        animation: "fadeUp 0.6s ease 0.1s both"
      }}>
        Study <span style={{ color: GOLD }}>Smarter.</span> Compete Harder.<br />Graduate Stronger.
      </h1>

      <p style={{
        fontFamily: F, fontSize: 17, color: "rgba(255,255,255,0.55)",
        lineHeight: 1.75, maxWidth: 520, marginBottom: "2.5rem",
        animation: "fadeUp 0.6s ease 0.25s both"
      }}>
        Prime gives university students in Cameroon AI-powered tools to study smarter,
        track progress, and stay ahead — all in one place.
      </p>

      <div style={{
        display: "flex", gap: "1rem", flexWrap: "wrap",
        justifyContent: "center", marginBottom: "4rem",
        animation: "fadeUp 0.6s ease 0.4s both"
      }}>
        <button onClick={() => navigate("/login")} style={{
          background: GOLD, border: "none", color: "#000",
          padding: "14px 32px", borderRadius: 10, fontSize: 16,
          fontWeight: 700, cursor: "pointer", fontFamily: F,
          position: "relative", overflow: "hidden",
          boxShadow: "0 8px 32px rgba(201,148,58,0.3)"
        }}>
          Start for Free →
          <span style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
            animation: "shimmer 4s ease-in-out 1.5s infinite", backgroundSize: "200% 100%"
          }} />
        </button>
        <button onClick={() => { const el = document.getElementById("features"); el && el.scrollIntoView({ behavior: "smooth" }); }} style={{
          background: "none", border: "1px solid #2a4a2a", color: "#ccc",
          padding: "14px 32px", borderRadius: 10, fontSize: 16,
          cursor: "pointer", fontFamily: F
        }}>See How It Works</button>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem",
        animation: "fadeUp 0.6s ease 0.55s both"
      }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🇨🇲", label: "Built for Cameroonian students" },
            { icon: "🌱", label: "New — join early" },
            { icon: "🗣️", label: "Bilingual: English & French" },
            { icon: "📱", label: "Pay with MTN MoMo & Orange Money" },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#1a2e1a", border: "1px solid #2a4a2a",
              borderRadius: 20, padding: "7px 14px"
            }}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>
          Built in Cameroon, for students in Cameroon and francophone West Africa.
        </p>
      </div>
    </section>
  );
}

function Problem() {
  const [ref, visible] = useInView();
  const cards = [
    {
      emoji: "🌊",
      title: "Drowning in information",
      desc: "Lectures, textbooks, past papers — the sheer volume of material is overwhelming. You don't know where to start, so you freeze."
    },
    {
      emoji: "⏰",
      title: "Focus keeps slipping",
      desc: "You sit down to study but 30 minutes later you're on your phone. Staying focused long enough to actually learn something feels impossible."
    },
    {
      emoji: "📄",
      title: "The blank page nightmare",
      desc: "Reports, assignments, essays — every time you have to write something structured, the blank page wins. Formatting kills your momentum."
    },
  ];
  return (
    <section id="problem" ref={ref} style={{ padding: "112px 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: F, fontWeight: 700, marginBottom: 12 }}>THE PROBLEM</div>
        <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#fff", margin: 0, letterSpacing: "-0.025em" }}>
          Sound familiar?
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
            borderRadius: 20, padding: "2rem",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>{c.emoji}</div>
            <div style={{ fontFamily: F, fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 8 }}>{c.title}</div>
            <div style={{ fontFamily: F, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
      borderRadius: 20, padding: "1.5rem",
      animation: "float 4s ease-in-out infinite",
      boxShadow: "0 16px 48px rgba(0,0,0,0.4)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: F, fontWeight: 700, fontSize: 14, color: "#fff" }}>Prime Dashboard</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map(c => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Study Hours", val: "24h", gold: true },
          { label: "Streak", val: "🔥 12d", gold: false },
        ].map(({ label, val, gold }) => (
          <div key={label} style={{ flex: 1, background: "#0d1a0d", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 18, color: gold ? GOLD : "#fff" }}>{val}</div>
          </div>
        ))}
      </div>
      {[
        { subject: "Mathematics", pct: 82 },
        { subject: "Biology", pct: 91 },
        { subject: "History", pct: 67 },
      ].map(({ subject, pct }) => (
        <div key={subject} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 5 }}>
            <span>{subject}</span>
            <span style={{ color: GOLD, fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 5, background: "#0d1a0d", borderRadius: 100 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: GOLD, borderRadius: 100 }} />
          </div>
        </div>
      ))}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#0d2a0d", borderRadius: 20, padding: "4px 12px",
        marginTop: 10, fontSize: 11, color: "#4caf50", fontFamily: F
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50" }} />
        StudyPal active
      </div>
    </div>
  );
}

function Solution() {
  const [ref, visible] = useInView();
  const points = [
    { emoji: "🧠", title: "AI that actually teaches", desc: "Ask StudyPal anything — get clear, patient explanations adapted to your level. No judgment, no waiting." },
    { emoji: "⏱️", title: "Focus engine built in", desc: "Pomodoro timer, session tracking, and streak system keep you accountable and in the zone." },
    { emoji: "✍️", title: "Write like a professional", desc: "The AI Report Writer turns your rough ideas into polished, structured academic writing in minutes." },
  ];
  return (
    <section id="solution" ref={ref} style={{ padding: "112px 2rem", background: "rgba(0,0,0,0.15)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: F, fontWeight: 700, marginBottom: 12 }}>THE SOLUTION</div>
          <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#fff", margin: "0 0 1rem", letterSpacing: "-0.025em" }}>
            One app that solves all of it
          </h2>
          <p style={{ fontFamily: F, fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "2.5rem", margin: "0 0 2.5rem" }}>
            Prime combines everything a student needs into one seamless, AI-powered experience.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {points.map(({ emoji, title, desc }, i) => (
              <div key={i} style={{
                display: "flex", gap: "1.25rem", alignItems: "flex-start",
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: "rgba(201,148,58,0.1)", border: "1px solid rgba(201,148,58,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                }}>{emoji}</div>
                <div>
                  <div style={{ fontFamily: F, fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s"
        }}>
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { Icon: MessageCircle, title: "StudyPal Chatbot",         desc: "Your 24/7 AI tutor. Ask anything, get instant explanations in English or French.", tags: ["AI Chat", "Any Subject", "EN & FR"] },
  { Icon: FileText,      title: "AI Report Writer",         desc: "Turn rough notes into polished, structured academic reports in minutes.", tags: ["Auto-structured", "Multiple formats", "Export ready"] },
  { Icon: Timer,         title: "Study Timer + Pomodoro",   desc: "Built-in Pomodoro and free-form sessions with circular progress tracking.", tags: ["Focus Sessions", "Session Logs"] },
  { Icon: BarChart2,     title: "Analytics & Streaks",      desc: "Track study hours, subject progress, and maintain your daily streak.", tags: ["Daily Streaks", "Progress Charts"] },
  { Icon: Target,        title: "Exam Coach",               desc: "Upload study material and receive practice questions, flashcards, and strategies.", tags: ["Practice Q's", "Flashcards"] },
  { Icon: BookOpen,      title: "Note Summarizer",          desc: "Paste lecture notes or readings and get crisp summaries with key points.", tags: ["Key Points", "Instant"] },
  { Icon: Trophy,        title: "The Grind Board",          desc: "Weekly leaderboard of top studiers in your network. Compete and stay motivated.", tags: ["Leaderboard", "Weekly Rankings"] },
  { Icon: Users,         title: "Friends & Study Network",  desc: "Add friends, see their progress, and form study groups to learn together.", tags: ["Social", "Study Groups"] },
  { Icon: Headphones,    title: "AI Support Agent",         desc: "24/7 in-app assistant to help you navigate Prime and answer any question.", tags: ["24/7 Support", "In-App"] },
  { Icon: Smartphone,    title: "Pay with Mobile Money",    desc: "No credit card needed. Pay with MTN Mobile Money or Orange Money.", tags: ["MTN MoMo", "Orange Money"] },
];

function Features() {
  const [ref, visible] = useInView();
  return (
    <section id="features" ref={ref} style={{ padding: "112px 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: F, fontWeight: 700, marginBottom: 12 }}>FEATURES</div>
        <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#fff", margin: 0, letterSpacing: "-0.025em" }}>
          Everything you need to excel
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
        {FEATURES.map(({ Icon, title, desc, tags }, i) => (
          <div key={i} style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
            borderRadius: 20, padding: "1.75rem",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`
          }}>
            <div style={{ marginBottom: 12 }}><Icon size={20} strokeWidth={1.5} style={{ color: GOLD }} /></div>
            <div style={{ fontFamily: F, fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 6 }}>{title}</div>
            <div style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 14 }}>{desc}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  background: "rgba(201,148,58,0.1)", border: "1px solid rgba(201,148,58,0.2)",
                  color: GOLD, fontSize: 11, fontWeight: 600, padding: "3px 10px",
                  borderRadius: 100, fontFamily: F
                }}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Comparison() {
  const [ref, visible] = useInView();
  const rows = [
    { feature: "Price",                                    chatgpt: "~12,000 FCFA/mo",        prime: "from 2,500 FCFA/mo" },
    { feature: "Pay with MoMo / Orange Money",             chatgpt: "No (needs foreign card)", prime: "Yes" },
    { feature: "Knows your curriculum (GCE, uni syllabi)", chatgpt: "No",                      prime: "Yes" },
    { feature: "Past-paper exam coaching",                 chatgpt: "No",                      prime: "Yes" },
    { feature: "Study timer, streaks, leaderboard",        chatgpt: "No",                      prime: "Yes" },
    { feature: "Tracks your weak topics",                  chatgpt: "No",                      prime: "Yes" },
    { feature: "Works offline",                            chatgpt: "No",                      prime: "Yes (Pro)" },
  ];
  return (
    <section ref={ref} style={{ padding: "112px 2rem", background: "rgba(0,0,0,0.15)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: F, fontWeight: 700, marginBottom: 12 }}>VS CHATGPT</div>
          <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#fff", margin: "0 0 1.25rem", letterSpacing: "-0.025em" }}>
            Why Prime beats ChatGPT for Cameroonian students
          </h2>
          <p style={{ fontFamily: F, fontSize: 15, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
            ChatGPT is built for everyone. Prime is built for you — your syllabus, your exams, your money.
          </p>
        </div>
        <div style={{
          background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
          borderRadius: 20, overflow: "hidden",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `1px solid ${CARD_BORDER}` }}>
            <div style={{ padding: "1rem 1.5rem" }} />
            <div style={{ padding: "1rem 1.5rem", fontFamily: F, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, borderLeft: `1px solid ${CARD_BORDER}`, textAlign: "center" }}>ChatGPT Plus</div>
            <div style={{ padding: "1rem 1.5rem", fontFamily: F, fontSize: 12, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: 1, borderLeft: `1px solid ${CARD_BORDER}`, textAlign: "center" }}>Prime</div>
          </div>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              borderBottom: i < rows.length - 1 ? `1px solid ${CARD_BORDER}` : "none",
              background: i % 2 === 1 ? "rgba(255,255,255,0.02)" : "transparent"
            }}>
              <div style={{ padding: "0.9rem 1.5rem", fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>{row.feature}</div>
              <div style={{ padding: "0.9rem 1.5rem", fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.35)", borderLeft: `1px solid ${CARD_BORDER}`, textAlign: "center", lineHeight: 1.45 }}>{row.chatgpt}</div>
              <div style={{ padding: "0.9rem 1.5rem", fontFamily: F, fontSize: 13, color: GOLD, fontWeight: 600, borderLeft: `1px solid ${CARD_BORDER}`, textAlign: "center", lineHeight: 1.45 }}>{row.prime}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ navigate }) {
  const [ref, visible] = useInView();
  const plans = [
    {
      name: "Free", price: "$0", period: "/month", popular: false,
      desc: "Perfect for getting started.",
      features: ["StudyPal (20 messages/day)", "Study Timer & Pomodoro", "Basic streak tracking", "1 AI Report per week"],
      disabled: ["Analytics dashboard", "Exam Coach", "The Grind Board"],
      cta: "Get Started Free", primary: false
    },
    {
      name: "Basic", price: "2,500", period: " FCFA/mo", popular: true,
      desc: "The most popular choice.",
      features: ["Unlimited AI chat sessions", "Focus timer + Pomodoro", "AI report rewriter (20/day)", "Analytics dashboard", "Leaderboard access"],
      disabled: ["Exam Coach", "Note Summarizer"],
      cta: "Get Basic", primary: true
    },
    {
      name: "Pro", price: "5,000", period: " FCFA/mo", popular: false,
      desc: "The full Prime experience.",
      features: ["Everything in Basic", "Unlimited report rewrites", "Note Summarizer + Exam Coach", "Unlimited file uploads", "Priority support", "The Grind Board"],
      disabled: [],
      cta: "Get Pro", primary: false
    },
  ];
  return (
    <section id="pricing" ref={ref} style={{ padding: "112px 2rem", background: "rgba(0,0,0,0.12)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: F, fontWeight: 700, marginBottom: 12 }}>PRICING</div>
          <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#fff", margin: "0 0 0.75rem", letterSpacing: "-0.025em" }}>
            Affordable for every student
          </h2>
          <p style={{ fontFamily: F, fontSize: 16, color: "rgba(255,255,255,0.45)", margin: 0 }}>Start free. Upgrade when you're ready.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
          {plans.map((p, i) => (
            <div key={i} style={{
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`
            }}>
              {p.popular ? (
                <div style={{
                  padding: 3, borderRadius: 23,
                  background: `conic-gradient(${GOLD} 0deg, #e8c070 90deg, ${GOLD} 180deg, #8a5a10 270deg, ${GOLD} 360deg)`,
                  animation: "glowPulse 2.5s ease-in-out infinite",
                  boxShadow: `0 0 40px rgba(201,148,58,0.25)`
                }}>
                  <div style={{ background: CARD_BG, borderRadius: 20, padding: "1.75rem", position: "relative" }}>
                    <div style={{
                      position: "absolute", top: -15, left: "50%", transform: "translateX(-50%)",
                      background: GOLD, color: "#000", fontSize: 11, fontWeight: 800,
                      padding: "4px 16px", borderRadius: 20, fontFamily: F, whiteSpace: "nowrap"
                    }}>MOST POPULAR</div>
                    <PricingCardInner plan={p} navigate={navigate} />
                  </div>
                </div>
              ) : (
                <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 20, padding: "1.75rem" }}>
                  <PricingCardInner plan={p} navigate={navigate} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCardInner({ plan, navigate }) {
  return (
    <>
      <div style={{ fontFamily: F, fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, marginTop: plan.popular ? 12 : 0 }}>{plan.name}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
        <span style={{ fontFamily: F, fontWeight: 800, fontSize: 38, color: "#fff", letterSpacing: "-0.02em" }}>{plan.price}</span>
        <span style={{ fontFamily: F, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{plan.period}</span>
      </div>
      <div style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: `1px solid ${CARD_BORDER}` }}>{plan.desc}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: 10 }}>
        {plan.features.map((f, j) => (
          <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: F, lineHeight: 1.45 }}>
            <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
          </li>
        ))}
        {plan.disabled.map((f, j) => (
          <li key={`d${j}`} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.22)", fontFamily: F, lineHeight: 1.45, textDecoration: "line-through" }}>
            <span style={{ flexShrink: 0 }}>–</span> {f}
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("/login")} style={{
        width: "100%", background: plan.primary ? GOLD : "transparent",
        border: plan.primary ? "none" : `1px solid ${CARD_BORDER}`,
        color: plan.primary ? "#000" : "rgba(255,255,255,0.6)",
        padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: plan.primary ? 700 : 500,
        cursor: "pointer", fontFamily: F
      }}>{plan.cta}</button>
    </>
  );
}

const FAQS = [
  { q: "How is Prime different from just using ChatGPT?", a: "Prime is built specifically for students — it combines AI chat with a Pomodoro timer, progress analytics, streak tracking, and a dedicated report writer. It's a complete study system, not just a chatbot." },
  { q: "What subjects does Prime support?", a: "All of them. Maths, Sciences, History, Literature, Languages, Economics, Computer Science — if you can study it, Prime can help." },
  { q: "Is my data private and secure?", a: "Yes. Your conversations and study data are encrypted and never sold to third parties." },
  { q: "Can I cancel my subscription anytime?", a: "Completely. No lock-in, no cancellation fees. Cancel from settings and you keep access until the end of your billing period." },
  { q: "Does Prime work on mobile?", a: "Yes — Prime is fully responsive on desktop, tablet, and mobile. A native app is on the roadmap." },
  { q: "How do I pay with Mobile Money?", a: "We support MTN Mobile Money and Orange Money. Just select your provider at checkout and follow the prompts — no bank card required." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  const [ref, visible] = useInView();
  return (
    <section id="faq" ref={ref} style={{ padding: "112px 2rem", maxWidth: 740, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: F, fontWeight: 700, marginBottom: 12 }}>FAQ</div>
        <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", color: "#fff", margin: 0, letterSpacing: "-0.025em" }}>
          Common questions
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {FAQS.map((f, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{
            background: CARD_BG,
            border: `1px solid ${open === i ? GOLD : CARD_BORDER}`,
            borderRadius: 14, padding: "1.1rem 1.25rem", cursor: "pointer",
            opacity: visible ? 1 : 0,
            transition: `opacity 0.4s ease ${i * 0.06}s, border-color 0.2s`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: F, fontSize: 14, color: "#fff", fontWeight: 600, paddingRight: 12 }}>{f.q}</span>
              <span style={{ color: GOLD, fontSize: 16, transform: open === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>▼</span>
            </div>
            {open === i && (
              <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 10, marginBottom: 0, lineHeight: 1.65 }}>{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ navigate }) {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} style={{ padding: "112px 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 700, height: 700, pointerEvents: "none",
        background: "radial-gradient(circle, rgba(201,148,58,0.08) 0%, transparent 65%)"
      }} />
      <div style={{
        maxWidth: 680, margin: "0 auto", position: "relative",
        background: CARD_BG, border: "1px solid rgba(201,148,58,0.25)",
        borderRadius: 28, padding: "4.5rem 3rem",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        animation: visible ? "glowPulse 3s ease-in-out infinite" : "none"
      }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: "uppercase", fontFamily: F, fontWeight: 700, marginBottom: 16 }}>GET STARTED</div>
        <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#fff", margin: "0 0 1rem", letterSpacing: "-0.025em" }}>
          Your best grades start here.
        </h2>
        <p style={{ fontFamily: F, fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          Join thousands of students already studying smarter. No credit card required.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/login")} style={{
            background: GOLD, border: "none", color: "#000",
            padding: "14px 36px", borderRadius: 10, fontSize: 16,
            fontWeight: 700, cursor: "pointer", fontFamily: F,
            boxShadow: "0 8px 32px rgba(201,148,58,0.3)",
            position: "relative", overflow: "hidden"
          }}>
            Start for Free →
            <span style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              animation: "shimmer 4s ease-in-out 1.5s infinite", backgroundSize: "200% 100%"
            }} />
          </button>
          <button onClick={() => { const el = document.getElementById("features"); el && el.scrollIntoView({ behavior: "smooth" }); }} style={{
            background: "none", border: "1px solid #2a4a2a", color: "#ccc",
            padding: "14px 36px", borderRadius: 10, fontSize: 16,
            cursor: "pointer", fontFamily: F
          }}>Explore Features</button>
        </div>
        <div style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: "1.5rem" }}>
          No credit card required · Free forever plan · Cancel anytime
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: DARK_BG, minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes navSlide { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes shimmer { 0%,65%,100% { background-position: -200% 0; } 30% { background-position: 200% 0; } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(201,148,58,0.12); } 50% { box-shadow: 0 0 32px 6px rgba(201,148,58,0.22); } }
        .nav-links a:hover { color: #fff !important; }
        @media (max-width: 768px) { .nav-links { display: none !important; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
      `}</style>

      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <Problem />
      <Solution />
      <Features />
      <Comparison />
      <Pricing navigate={navigate} />
      <FAQ />
      <FinalCTA navigate={navigate} />

      <footer style={{
        borderTop: `1px solid ${CARD_BORDER}`,
        background: "rgba(0,0,0,0.2)",
        padding: "3rem 2rem"
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "3rem", marginBottom: "2.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4caf50" }} />
                <span style={{ fontFamily: F, fontWeight: 700, fontSize: 18, color: "#fff" }}>Prime</span>
              </div>
              <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65, maxWidth: 260, margin: 0 }}>
                The AI-powered study app for university students in Cameroon.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>Product</div>
              {["Features", "Pricing", "FAQ"].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{ display: "block", fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: 8 }}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>Account</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <button onClick={() => navigate("/login")} style={{
                  background: "none", border: `1px solid ${CARD_BORDER}`, color: "rgba(255,255,255,0.45)",
                  padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: F, textAlign: "left"
                }}>Sign In</button>
                <button onClick={() => navigate("/login")} style={{
                  background: GOLD, border: "none", color: "#000",
                  padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: F, textAlign: "left"
                }}>Get Started</button>
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${CARD_BORDER}`, paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <span style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.22)" }}>© 2026 Prime. All rights reserved.</span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Privacy", "Terms"].map(l => (
                <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", textDecoration: "none", fontFamily: F }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
