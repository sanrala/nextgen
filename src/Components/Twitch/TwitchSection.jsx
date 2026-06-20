import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://api.sm-artweb.fr";

// Liste des streamers à mettre en avant — pseudos Twitch (login, pas display name)
// TODO: remplacer par une config Firebase gérée depuis l'admin
const FEATURED_STREAMERS = ["ninja", "squeezie", "gotaga"];

const PARENT_DOMAIN =
  typeof window !== "undefined" ? window.location.hostname : "nextgen-gaming.fr";

function formatNextDate(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  if (isToday) return `Aujourd'hui à ${time}`;
  if (isTomorrow) return `Demain à ${time}`;
  return (
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) +
    ` à ${time}`
  );
}

const STYLES = `
  .tw-section { padding-top: 36px; }

  .tw-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
  @media (max-width: 991px) { .tw-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 575px)  { .tw-grid { grid-template-columns: 1fr; } }

  .tw-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .tw-card:hover { transform: translateY(-3px); }
  .tw-card.is-live { border-color: rgba(145,71,255,0.35); }

  .tw-media {
    position: relative;
    aspect-ratio: 16/9;
    background: #0a0a0a;
    overflow: hidden;
  }
  .tw-media img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .tw-media iframe {
    width: 100%; height: 100%;
    display: block;
    border: none;
  }

  .tw-live-badge {
    position: absolute;
    top: 10px; left: 10px;
    background: #9147ff;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    font-size: 9.5px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 4px 9px;
    border-radius: 4px;
    display: flex; align-items: center; gap: 5px;
    z-index: 2;
  }
  .tw-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #fff;
    animation: tw-pulse 1.5s ease-in-out infinite;
  }
  @keyframes tw-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  .tw-viewers {
    position: absolute;
    bottom: 10px; left: 10px;
    background: rgba(0,0,0,0.75);
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 700;
    padding: 4px 9px;
    border-radius: 4px;
    z-index: 2;
    display: flex; align-items: center; gap: 5px;
  }

  .tw-offline-avatar-wrap {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 50% 35%, rgba(145,71,255,0.12), transparent 70%);
  }
  .tw-offline-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255,255,255,0.1);
    filter: grayscale(0.4);
  }

  .tw-body { padding: 14px 16px 16px; }
  .tw-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 15.5px; font-weight: 800;
    color: #fff;
    margin: 0 0 4px;
  }
  .tw-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 11.5px;
    color: #999;
    line-height: 1.4;
    margin: 0 0 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tw-game-tag {
    display: inline-block;
    font-family: 'Montserrat', sans-serif;
    font-size: 10px; font-weight: 700;
    color: #9147ff;
    background: rgba(145,71,255,0.1);
    padding: 3px 9px;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .tw-next {
    display: flex; align-items: center; gap: 7px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 12.5px; font-weight: 600;
    color: #bbb;
  }
  .tw-next-icon { color: #dd163b; font-size: 13px; }
  .tw-no-schedule {
    font-family: 'Rajdhani', sans-serif;
    font-size: 12px; color: #555;
  }

  .tw-watch-btn {
    display: block;
    text-align: center;
    margin-top: 12px;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase;
    color: #fff;
    background: #9147ff;
    padding: 9px;
    border-radius: 6px;
    text-decoration: none;
    transition: background 0.2s ease;
  }
  .tw-watch-btn:hover { background: #7a2fe0; }

  .tw-empty {
    text-align: center;
    padding: 40px 0;
    color: #555;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
  }
`;

function StreamerCard({ streamer }) {
  const channelUrl = `https://www.twitch.tv/${streamer.login}`;

  if (streamer.isLive && streamer.live) {
    return (
      <div className="tw-card is-live">
        <div className="tw-media">
          <iframe
            src={`https://player.twitch.tv/?channel=${streamer.login}&parent=${PARENT_DOMAIN}&muted=true`}
            title={`Stream de ${streamer.displayName}`}
            allowFullScreen
          />
          <span className="tw-live-badge">
            <span className="tw-live-dot" /> En direct
          </span>
          {streamer.live.viewerCount != null && (
            <span className="tw-viewers">👁 {streamer.live.viewerCount.toLocaleString("fr-FR")}</span>
          )}
        </div>
        <div className="tw-body">
          <h4 className="tw-name">{streamer.displayName}</h4>
          {streamer.live.gameName && <span className="tw-game-tag">{streamer.live.gameName}</span>}
          {streamer.live.title && <p className="tw-title">{streamer.live.title}</p>}
        </div>
      </div>
    );
  }

  const nextLabel = formatNextDate(streamer.nextSegment?.startTime);

  return (
    <div className="tw-card">
      <div className="tw-media">
        <div className="tw-offline-avatar-wrap">
          <img className="tw-offline-avatar" src={streamer.avatar} alt={streamer.displayName} />
        </div>
      </div>
      <div className="tw-body">
        <h4 className="tw-name">{streamer.displayName}</h4>
        {nextLabel ? (
          <div className="tw-next">
            <span className="tw-next-icon">📅</span>
            <span>Prochain live : {nextLabel}</span>
          </div>
        ) : (
          <div className="tw-no-schedule">Aucun planning annoncé</div>
        )}
        <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="tw-watch-btn">
          Voir la chaîne
        </a>
      </div>
    </div>
  );
}

function TwitchSection() {
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/twitch-status?logins=${FEATURED_STREAMERS.join(",")}`);
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();
        const filtered = data.filter((s) => s.isLive || s.nextSegment);
        const sorted = [...filtered].sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0));
        setStreamers(sorted);
      } catch (e) {
        console.error("Erreur chargement statut Twitch", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 60 * 1000); // refresh toutes les 60s
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (streamers.length === 0) return null;

  return (
    <div className="tw-section">
      <style>{STYLES}</style>
      <div className="row vertical-gap">
        <div className="col-lg-12">
          <h3 className="nk-decorated-h-2">
            <span>
              <span className="text-main-1">Nos streamers</span> Twitch
            </span>
          </h3>
          <div className="nk-gap" />
        </div>
      </div>

      <div className="tw-grid">
        {streamers.map((s) => (
          <StreamerCard key={s.login} streamer={s} />
        ))}
      </div>
    </div>
  );
}

export default TwitchSection;