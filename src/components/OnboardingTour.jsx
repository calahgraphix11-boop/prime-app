/*
 * SUPABASE MIGRATION — run once in Supabase SQL Editor before deploying:
 *
 *   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Welcome to Prime",
    description: "Your AI-powered study companion. Let's show you around.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "StudyPal AI",
    description: "Chat with your AI study assistant anytime. Ask questions, get explanations, study smarter.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Focus Sessions",
    description: "Start a Pomodoro session and track every minute of your study time.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Report Writer",
    description: "Generate and rewrite academic reports with AI in seconds.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Analytics",
    description: "Track your progress, streaks, and study habits over time.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
        <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z" />
        <polyline points="8 6 12 3 16 6" />
      </svg>
    ),
    title: "Leaderboard",
    description: "Compete with friends and climb the weekly rankings.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9943A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    title: "You're all set!",
    description: "Manage your account and preferences in Settings anytime. Let's get studying!",
  },
];

const OVERLAY_STYLE = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const CARD_STYLE = {
  background: "linear-gradient(135deg, #0a1f0a, #1a3a1a)",
  border: "1px solid #2a4a2a",
  borderRadius: "20px",
  padding: "40px",
  maxWidth: "420px",
  width: "100%",
  fontFamily: "'Inter', system-ui, sans-serif",
};

export default function OnboardingTour() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data?.onboarding_complete) {
          setTimeout(() => setVisible(true), 1000);
        }
      });
  }, [user?.id]);

  const goTo = useCallback((next) => {
    setStep(next);
    setAnimKey((k) => k + 1);
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      goTo(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) goTo(step - 1);
  };

  const handleFinish = () => {
    setVisible(false);
    if (user) {
      supabase.from("profiles").update({ onboarding_complete: true }).eq("id", user.id);
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={OVERLAY_STYLE}>
      <div style={CARD_STYLE}>
        {/* Animated content area */}
        <div
          key={animKey}
          style={{ animation: "ob-slide-in 260ms cubic-bezier(0.23,1,0.32,1) both" }}
        >
          {/* Icon */}
          <div style={{ marginBottom: "24px" }}>
            {current.icon}
          </div>

          {/* Title */}
          <h2 style={{
            margin: "0 0 12px",
            color: "#ffffff",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            {current.title}
          </h2>

          {/* Description */}
          <p style={{
            margin: "0 0 32px",
            color: "#8ab08a",
            fontSize: "15px",
            lineHeight: 1.6,
          }}>
            {current.description}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          height: "3px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "999px",
          marginBottom: "28px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "#C9943A",
            borderRadius: "999px",
            transition: "width 280ms cubic-bezier(0.23,1,0.32,1)",
          }} />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Step counter */}
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginRight: "auto" }}>
            {step + 1} / {STEPS.length}
          </span>

          {step > 0 && (
            <button
              onClick={handleBack}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.65)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            >
              ← Back
            </button>
          )}

          <button
            onClick={isLast ? handleFinish : handleNext}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              border: "none",
              background: "#C9943A",
              color: "#1a0c00",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 150ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {isLast ? "Get Started" : "Next →"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ob-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
