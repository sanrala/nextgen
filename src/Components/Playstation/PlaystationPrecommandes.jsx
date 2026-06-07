import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

function formatDate(dateStr) {
  if (!dateStr) return null;
  if (/^\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function PlaystationPrecommandes() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/precommandes-playstation`);
        const data = await res.json();
        setGames(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (e) {
        console.error("Erreur PlayStation prochaines sorties:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;
  if (!games.length) return null;

  return (
    <div>
      <div className="nk-gap-2" />
      <Link to="/Populaires/?platform=PlayStation">
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">PlayStation</span> — Prochaines sorties
          </span>
        </h3>
      </Link>
      <div className="nk-gap" />
      <div className="nk-blog-grid">
        <div className="row">
          {games.map(game => {
            const promo = getPromo(game.retail, game.price);
            const price = parseFloat(game.price);
       const path = game._igFound && game._igId
  ? `/store/${game._igId}/0/${cleanTitle(game.name)}`
  : `/store-ps/${game._rawgId || game.id}/${cleanTitle(game.name)}`;

            const cardContent = (
              <div className="nk-blog-post">
                <div className="nk-post-img">
                  <img
                    src={game.img}
                    alt={game.name}
                    className="img-fluid"
                    style={{ width: "100%", objectFit: "cover" }}
                  />
                  {promo && <span className="nk-post-comments-count">{promo}</span>}
                  <span className="nk-post-categories">
                    <span className="bg-main-5">{game.type}</span>
                  </span>
                </div>
                <div className="nk-gap" />
                <span className="nk-post-title h4">
                  {game.name.length > 22 ? game.name.slice(0, 22) + "…" : game.name}
                </span>
                <div className="nk-gap" />
                <div className="d-flex justify-content-between text-white">
                  <span className="preco__date">📅 {formatDate(game.releaseDate)}</span>
                  <span>{price > 0 ? `${price.toFixed(2)} €` : "À venir"}</span>
                </div>
              </div>
            );

            return (
              <div className="col-md-6 col-lg-4" key={game.id || game.name}>
                {path
                  ? <Link to={path} style={{ textDecoration: "none" }}>{cardContent}</Link>
                  : game.url
                    ? <a href={game.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{cardContent}</a>
                    : cardContent
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PlaystationPrecommandes;