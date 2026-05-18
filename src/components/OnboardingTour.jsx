/*
 * SUPABASE MIGRATION — run once in Supabase SQL Editor before deploying:
 *
 *   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
 */
import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// Selector configs — resolved to real DOM elements at tour start.
// IDs are defined in Sidebar.jsx on the NavLink elements.
//
// Sidebar nav IDs:
//   #prime-sidebar   → <aside> container
//   #nav-studypal    → /chat  (AI Chatbot / StudyPal)
//   #nav-sessions    → /sessions
//   #nav-report      → /report
//   #nav-dashboard   → / (Analytics / Dashboard)
//   #nav-leaderboard → /leaderboard
//   #nav-settings    → /settings
const STEP_CONFIGS = [
  {
    selector: "#prime-sidebar",
    intro: "This is your navigation. Access all Prime features from here.",
    position: "right",
  },
  {
    selector: "#nav-studypal",
    intro: "Chat with your AI study assistant anytime.",
    position: "right",
  },
  {
    selector: "#nav-sessions",
    intro: "Start a focus session here. Track your time with Pomodoro mode.",
    position: "right",
  },
  {
    selector: "#nav-report",
    intro: "Generate and rewrite academic reports with AI in seconds.",
    position: "right",
  },
  {
    selector: "#nav-dashboard",
    intro: "Track your progress, streaks, and study habits over time.",
    position: "right",
  },
  {
    selector: "#nav-leaderboard",
    intro: "Compete with friends and climb the weekly rankings.",
    position: "right",
  },
  {
    selector: "#nav-settings",
    intro: "Manage your account, appearance, and preferences here.",
    position: "right",
  },
];

export default function OnboardingTour({ openSidebar, closeSidebar }) {
  const { user } = useAuth();
  const tourRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!user || startedRef.current) return;

    supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.onboarding_complete) return;
        startedRef.current = true;
        setTimeout(() => launchTour(), 1000);
      });
  }, [user?.id]);

  function markComplete() {
    if (!user) return;
    supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("id", user.id);
  }

  function launchTour() {
    openSidebar();

    // Wait for sidebar slide-in transition (300ms) before resolving elements
    setTimeout(() => {
      const steps = STEP_CONFIGS
        .map(({ selector, intro, position }) => {
          const el = document.querySelector(selector);
          if (!el) {
            console.warn(`OnboardingTour: element not found for selector "${selector}" — step skipped`);
            return null;
          }
          return { element: el, intro, position, scrollTo: "element" };
        })
        .filter(Boolean);

      if (steps.length === 0) {
        markComplete();
        return;
      }

      const tour = introJs();
      tourRef.current = tour;

      tour.setOptions({
        steps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        disableInteraction: true,
        scrollToElement: true,
        showSkipButton: false,
        nextLabel: "Next →",
        prevLabel: "← Back",
        doneLabel: "Done",
        tooltipClass: "prime-intro-tooltip",
        highlightClass: "prime-intro-highlight",
      });

      tour.oncomplete(() => {
        markComplete();
        closeSidebar();
      });

      tour.onexit(() => {
        markComplete();
        closeSidebar();
      });

      tour.start();
    }, 350);
  }

  return null;
}
