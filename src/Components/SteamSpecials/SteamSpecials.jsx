import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://api.sm-artweb.fr";

const CSS = `
.ss-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: #111;
  border-radius: 4px;
  overflow: hidden;
}
.ss-main {
  position: relative;
  overflow: hidden;
  min-height: 320px;
  cursor: pointer;
  display: block;
  text-decoration: none;
}
.ss-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.ss-main:hover img { transform: scale(1.03); }
.ss-main-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 40%, transparent 70%);
}
.ss-main-badge {
  position: absolute;
  top: 12px; left: 12px;
  background: #14487b;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.ss-discount-badge {
  position: absolute;
  top: 12px; right: 12px;
  background: #dd163b;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 3px;
}
.ss-main-info {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 16px;
}
.ss-main-title {
  font-family: Rajdhani, sans-serif;
  font-size: clamp(16px, 2vw, 22px);
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  margin: 0 0 8px;
}
.ss-main-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.ss-main-retail {
  color: #888;
  text-decoration: line-through;
  font-size: 13px;
}
.ss-main-final {
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  font-family: Montserrat, sans-serif;
}
.ss-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}
.ss-item:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}
.ss-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  background: #161b22;
  cursor: pointer;
  transition: background 0.15s;
  text-decoration: none;
}
.ss-item:hover { background: #1e252f; }
.ss-item-thumb {
  position: relative;
  flex-shrink: 0;
  width: 90px;
  height: 60px;
  border-radius: 3px;
  overflow: hidden;
}
.ss-item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ss-item-discount {
  position: absolute;
  bottom: 3px; right: 3px;
  background: #dd163b;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 2px;
}
.ss-item-body { flex: 1; min-width: 0; }
.ss-item-badge {
  font-size: 9px;
  font-weight: 700;
  color: #14487b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 3px;
}
.ss-item-title {
  font-family: Rajdhani, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #ddd;
  line-height: 1.3;
  margin: 0 0 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ss-item-price { display: flex; align-items: baseline; gap: 5px; }
.ss-item-retail { color: #666; text-decoration: line-through; font-size: 11px; }
.ss-item-final  { color: #fff; font-weight: 700; font-size: 13px; font-family: Montserrat, sans-serif; }
@media (max-width: 767px) {
  .ss-container { grid-template-columns: 1fr; }
  .ss-main { min-height: 220px; }
  .ss-grid { grid-template-columns: 1fr; }
}
`;

function SteamSpecials() {
  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/steam-specials`)
      .then(r => r.json())
      .then(d => { setGames(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleClick = (game, e) => {
    e.preventDefault();
    if (game.igId) {
      const slug = game.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
      navigate(`/store/${game.igId}/${game.id}/${slug}`);
    } else {
      window.open(game.url, "_blank", "noopener");
    }
  };

  if (loading || games.length === 0) return null;

  const main = games[0];
  const rest = games.slice(1); // 9 jeux → grille 2 cols = 5 lignes (4+5)

  return (
    <div>
      <style>{CSS}</style>
      <div className="nk-gap-2" />
      <h3 className="nk-decorated-h-2">
        <span>
          <span className="text-main-1">Offres</span> Steam du moment
        </span>
      </h3>
      <div className="nk-gap" />

      <div className="ss-container">

        {/* Grande carte principale */}
        <a href={main.url} className="ss-main" onClick={e => handleClick(main, e)}>
          <img src={main.img} alt={main.name} />
          <div className="ss-main-overlay" />
          <div className="ss-main-badge">Steam</div>
          <div className="ss-discount-badge">-{main.discount}%</div>
          <div className="ss-main-info">
            <div className="ss-main-title">{main.name}</div>
            <div className="ss-main-price">
              <span className="ss-main-retail">{main.retail} €</span>
              <span className="ss-main-final">{main.price} €</span>
            </div>
          </div>
        </a>

        {/* Grille droite — 9 items sur 2 colonnes */}
        <div className="ss-grid">
          {rest.map(game => (
            <a key={game.id} href={game.url} className="ss-item" onClick={e => handleClick(game, e)}>
              <div className="ss-item-thumb">
                <img
                  src={game.img}
                  alt={game.name}
                  onError={e => e.target.style.display = "none"}
                />
                <span className="ss-item-discount">-{game.discount}%</span>
              </div>
              <div className="ss-item-body">
                <div className="ss-item-badge">STEAM PROMO</div>
                <div className="ss-item-title">{game.name}</div>
                <div className="ss-item-price">
                  <span className="ss-item-retail">{game.retail} €</span>
                  <span className="ss-item-final">{game.price} €</span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}

export default SteamSpecials;