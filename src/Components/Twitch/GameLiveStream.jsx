import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://api.sm-artweb.fr";
const FEATURED_STREAMERS = ["ninja", "squeezie", "gotaga","anyme023", "animematue", "locklear", "kamet0","inoxtag" ,"michou", "tonton", "oonolive", "jbast6262", "upblablah"]; // même liste que TwitchSection — à terme: Firebase

const PARENT_DOMAIN =
  typeof window !== "undefined" ? window.location.hostname : "nextgen-gaming.fr";

// Normalise un nom de jeu pour comparaison (minuscule, sans ponctuation/accents)
function normalizeGameName(name) {
  return (name || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const STYLES = `
  .gls-card {
    background: rgba(145,71,255,0.06);
    border: 1px solid rgba(145,71,255,0.3);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  .gls-header {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px;
    background: rgba(145,71,255,0.1);
  }
  .gls-live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #9147ff;
    animation: gls-pulse 1.5s ease-in-out infinite;
  }
  @keyframes gls-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .gls-header-text {
    font-family: 'Montserrat', sans-serif;
    font-size: 11.5px; font-weight: 700;
    letter-spacing: 0.04em; text-transform: uppercase;
    color: #b388ff;
  }
  .gls-media {
    aspect-ratio: 16/9;
    background: #0a0a0a;
  }
  .gls-media iframe {
    width: 100%; height: 100%;
    display: block;
    border: none;
  }
  .gls-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
  }
  .gls-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 14.5px; font-weight: 800;
    color: #fff;
    margin: 0;
  }
  .gls-watch-link {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 700;
    color: #9147ff;
    text-decoration: none;
  }
  .gls-watch-link:hover { color: #b388ff; }
`;

function GameLiveStream({ gameName }) {
  const [matchedStreamer, setMatchedStreamer] = useState(null);

  useEffect(() => {
    if (!gameName) return;
    let cancelled = false;

    const checkLive = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/twitch-status?logins=${FEATURED_STREAMERS.join(",")}`);
        if (!res.ok) return;
        const data = await res.json();
        const target = normalizeGameName(gameName);
        console.log("[GameLiveStream] gameName brut:", gameName, "→ normalisé:", target);
        console.log("[GameLiveStream] streamers live:", data.filter(s => s.isLive).map(s => ({ login: s.login, liveGame: s.live?.gameName, normalisé: normalizeGameName(s.live?.gameName) })));

        const match = data.find((s) => {
          if (!s.isLive || !s.live?.gameName) return false;
          const liveGame = normalizeGameName(s.live.gameName);
          // Match exact ou inclusion partielle (gère les éditions/sous-titres)
          return liveGame === target || liveGame.includes(target) || target.includes(liveGame);
        });

        if (!cancelled) setMatchedStreamer(match || null);
      } catch {
        if (!cancelled) setMatchedStreamer(null);
      }
    };

    checkLive();
    const interval = setInterval(checkLive, 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [gameName]);

  if (!matchedStreamer) return null;

  return (
    <div className="gls-card">
      <style>{STYLES}</style>
      <div className="gls-header">
        <span className="gls-live-dot" />
        <span className="gls-header-text">En direct sur ce jeu</span>
      </div>
      <div className="gls-media">
        <iframe
          src={`https://player.twitch.tv/?channel=${matchedStreamer.login}&parent=${PARENT_DOMAIN}&muted=true`}
          title={`Stream de ${matchedStreamer.displayName}`}
          allowFullScreen
        />
      </div>
      <div className="gls-footer">
        <h4 className="gls-name">{matchedStreamer.displayName}</h4>
        <a
          href={`https://www.twitch.tv/${matchedStreamer.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gls-watch-link"
        >
          Voir sur Twitch ↗
        </a>
      </div>
    </div>
  );
}

export default GameLiveStream;