import { getCharacter } from "../lib/gamification";

// Circular character portrait with the rank crest overlapping its corner.
// Falls back to the plain rank crest when no character has been picked yet.
export default function CharacterPortrait({ characterKey, rank, size = 40, className = "" }) {
  const character = getCharacter(characterKey);

  if (!character) {
    return (
      <img
        src={rank.icon}
        alt={rank.name}
        className={`flex-shrink-0 ${className}`}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }

  const crestSize = Math.round(size * 0.52);

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full overflow-hidden"
        style={{ border: "2px solid rgba(245,168,0,0.45)", background: "rgba(255,255,255,0.05)" }}
      >
        <img src={character.icon} alt={character.name} className="w-full h-full object-cover" />
      </div>
      <img
        src={rank.icon}
        alt={rank.name}
        className="absolute rounded-full"
        style={{
          width: crestSize,
          height: crestSize,
          bottom: -crestSize * 0.12,
          right: -crestSize * 0.12,
          objectFit: "contain",
          background: "#0a1a10",
          border: "2px solid rgba(0,26,16,0.95)",
        }}
      />
    </div>
  );
}
