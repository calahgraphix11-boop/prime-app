import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { localize } from "../lib/gamification";

// The modal has exactly one focusable element (Continue), so trapping focus
// just means keeping Tab from ever leaving the button.
export default function LevelUpModal({ level, rank, rankChanged, onDismiss }) {
  const { t, lang } = useApp();
  const [closing, setClosing] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    buttonRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(onDismiss, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "Tab") {
        e.preventDefault();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`levelup-overlay${closing ? " levelup-overlay--closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${t.level} ${level} ${t.reached}`}
    >
      <div className={`levelup-panel glass-elevated${closing ? " levelup-panel--closing" : ""}`}>
        {rankChanged && <div className="levelup-glow" aria-hidden="true" />}
        <img
          src={rank.icon}
          alt={localize(rank.name, lang)}
          className="levelup-crest"
          style={{ width: 140, height: 140, objectFit: "contain" }}
        />
        <div className="levelup-headline">{t.level} {level}</div>
        {rankChanged ? (
          <div className="levelup-rank levelup-rank--changed">{t.rankReachedPrefix} {localize(rank.name, lang)} {t.rankReachedSuffix}</div>
        ) : (
          <div className="levelup-rank">{localize(rank.name, lang)}</div>
        )}
        <button ref={buttonRef} type="button" className="levelup-continue" onClick={close}>
          {t.continueLabel}
        </button>
      </div>
    </div>
  );
}
