import { useEffect, useRef, useState } from "react";

// The modal has exactly one focusable element (Continue), so trapping focus
// just means keeping Tab from ever leaving the button.
export default function LevelUpModal({ level, rank, rankChanged, onDismiss }) {
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
      aria-label={`Level ${level} reached`}
    >
      <div className={`levelup-panel glass-elevated${closing ? " levelup-panel--closing" : ""}`}>
        {rankChanged && <div className="levelup-glow" aria-hidden="true" />}
        <img
          src={rank.icon}
          alt={rank.name}
          className="levelup-crest"
          style={{ width: 140, height: 140, objectFit: "contain" }}
        />
        <div className="levelup-headline">Level {level}</div>
        {rankChanged ? (
          <div className="levelup-rank levelup-rank--changed">You've reached {rank.name} rank!</div>
        ) : (
          <div className="levelup-rank">{rank.name}</div>
        )}
        <button ref={buttonRef} type="button" className="levelup-continue" onClick={close}>
          Continue
        </button>
      </div>
    </div>
  );
}
