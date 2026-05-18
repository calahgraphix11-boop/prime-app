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

const STEPS = [
  {
    element: "#prime-sidebar",
    intro: "This is your navigation. Access all Prime features from here.",
    position: "right",
  },
  {
    element: "#chatbubble-btn",
    intro: "Chat with your AI study assistant anytime during a session.",
    position: "left",
  },
  {
    element: "#nav-sessions",
    intro: "Start a focus session here. Track your study time with Pomodoro mode.",
    position: "right",
  },
  {
    element: "#nav-report",
    intro: "Generate and rewrite academic reports with AI in seconds.",
    position: "right",
  },
  {
    element: "#nav-dashboard",
    intro: "Track your progress, streaks, and study habits over time.",
    position: "right",
  },
  {
    element: "#nav-leaderboard",
    intro: "Compete with friends and climb the weekly rankings.",
    position: "right",
  },
  {
    element: "#nav-settings",
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

    // Give sidebar animation time to finish before targeting elements
    setTimeout(() => {
      const tour = introJs();
      tourRef.current = tour;

      tour.setOptions({
        steps: STEPS,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        disableInteraction: true,
        scrollToElement: false,
        nextLabel: "Next →",
        prevLabel: "← Back",
        doneLabel: "Done",
        skipLabel: "Skip",
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
