import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const BACKEND_URL = "https://api.sm-artweb.fr";

function cleanTitle(name) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

function getPromo(retail, price) {
  const r = parseFloat(retail);
  const p = parseFloat(price);
  if (!r || !p || r <= p) return null;
  return `-${Math.round(((r - p) / r) * 100)}%`;
}

const STYLES = `
  .snr-layout {
    padding-top: 92px;
    min-height: 100vh;
  }
  .snr-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px 24px 40px;
  }
  .snr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .snr-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #fff;
    margin: 0;
    line-height: 1;
  }
  .snr-title .accent { color: #dd163b; }
  .snr-count {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #444;
    letter-spacing: 0.06em;
  }
  .snr-count strong { color: #dd163b; }

  .snr-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  @media (max-width: 1200px) { .snr-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 900px)  { .snr-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px)  { .snr-grid { grid-template-columns: 1fr; } }

  .snr-card {
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .snr-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    border-color: rgba(221,22,59,0.25);
  }
  .snr-card-img {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
  }
  .snr-card-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .snr-card:hover .snr-card-img img { transform: scale(1.04); }

  .snr-card-promo {
    position: absolute;
    top: 8px; right: 8px;
    background: #dd163b;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    padding: 3px 8px;
    border-radius: 3px;
    letter-spacing: 0.04em;
    box-shadow: 0 2px 8px rgba(221,22,59,0.5);
  }
  .snr-card-badge {
    position: absolute;
    top: 8px; left: 8px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 3px;
    padding: 2px 7px;
    font-size: 9px;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    color: rgba(255,255,255,0.65);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .snr-card-ig-badge {
    position: absolute;
    bottom: 8px; left: 8px;
    background: rgba(221,22,59,0.85);
    backdrop-filter: blur(6px);
    border-radius: 3px;
    padding: 2px 7px;
    font-size: 9px;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    color: #fff;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .snr-card-body {
    padding: 10px 12px 12px;
  }
  .snr-card-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #ddd;
    line-height: 1.3;
    margin: 0 0 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s;
  }
  .snr-card:hover .snr-card-name { color: #fff; }

  .snr-card-price-row {
    display: flex;
    align-items: baseline;
    gap: 7px;
  }
  .snr-card-price {
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }
  .snr-card-price.ig { color: #dd163b; }
  .snr-card-retail {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #444;
    text-decoration: line-through;
  }
  .snr-card-steam-label {
    font-size: 9px;
    font-family: 'Montserrat', sans-serif;
    color: #555;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-left: 4px;
  }

  .snr-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 0; gap: 16px;
  }
  .snr-spinner {
    width: 36px; height: 36px;
    border: 2px solid rgba(221,22,59,0.15);
    border-top-color: #dd163b;
    border-radius: 50%;
    animation: snrSpin 0.75s linear infinite;
  }
  @keyframes snrSpin { to { transform: rotate(360deg); } }
  .snr-spinner-text {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px; letter-spacing: 0.2em;
    color: #333; text-transform: uppercase;
  }
  .snr-empty {
    text-align: center; padding: 80px 0;
    color: #333; font-family: 'Montserrat', sans-serif;
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  }
`;

function GameCard({ game }) {
  const igPromo = game.igId ? getPromo(game.igRetail, game.igPrice) : null;
  const steamPromo = !game.igId ? getPromo(game.retail, game.price) : null;
  const promo = igPromo || steamPromo;

  const handleClick = () => {
    if (game.igId) {
      window.location.href = `/store/${game.igId}/${game.steamId}/${cleanTitle(game.name)}`;
    } else {
      window.open(`https://store.steampowered.com/app/${game.steamId}`, '_blank');
    }
  };

  const displayPrice = game.igId ? game.igPrice : game.price;
  const displayRetail = game.igId ? game.igRetail : game.retail;

  return (
    <div className="snr-card" onClick={handleClick}>
      <div className="snr-card-img">
        <img src={game.img} alt={game.name} loading="lazy" />
        {promo && <span className="snr-card-promo">{promo}</span>}
        <span className="snr-card-badge">Steam</span>
        {game.igId && game.igStock === 1 && (
          <span className="snr-card-ig-badge">🏷️ Dispo sur IG</span>
        )}
      </div>
      <div className="snr-card-body">
        <div className="snr-card-name">{game.name}</div>
        <div className="snr-card-price-row">
          {parseFloat(displayRetail) > parseFloat(displayPrice) && (
            <span className="snr-card-retail">{parseFloat(displayRetail).toFixed(2)} €</span>
          )}
          {parseFloat(displayPrice) > 0 ? (
            <>
              <span className={`snr-card-price${game.igId ? " ig" : ""}`}>
                {parseFloat(displayPrice).toFixed(2)} €
              </span>
              {game.igId && <span className="snr-card-steam-label">via IG</span>}
            </>
          ) : (
            <span style={{ color: "#444", fontSize: "11px", fontFamily: "'Montserrat', sans-serif", fontStyle: "italic" }}>
              Prix à venir
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SteamNewReleases() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/steam-newreleases`);
        const data = await res.json();
        setGames(data || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les nouveautés Steam.");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <div className="App" style={{ background: "transparent" }}>
      <style>{STYLES}</style>
      <Header />
      <div className="nk-main">
        <div className="snr-layout">
          <div className="snr-main">
            <div className="snr-header">
              <h1 className="snr-title">
                <span className="accent">Nouveautés</span> Steam
              </h1>
              {!loading && (
                <div className="snr-count">
                  <strong>{games.length}</strong> jeu{games.length > 1 ? "x" : ""}
                </div>
              )}
            </div>

            {loading && (
              <div className="snr-loading">
                <div className="snr-spinner" />
                <span className="snr-spinner-text">Chargement des nouveautés</span>
              </div>
            )}
            {error && <div className="snr-empty" style={{ color: "#dd163b" }}>{error}</div>}
            {!loading && !error && games.length === 0 && (
              <div className="snr-empty">Aucune nouveauté disponible</div>
            )}
            {!loading && !error && games.length > 0 && (
              <div className="snr-grid">
                {games.map(game => <GameCard key={game.steamId} game={game} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="separator product-panel" />
      <Footer />
    </div>
  );
}

export default SteamNewReleases;
