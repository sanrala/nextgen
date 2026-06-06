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

function PlaystationTendances() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/topsellers-playstation`);
        const data = await res.json();
        setGames(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (e) {
        console.error("Erreur PlayStation tendances:", e);
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
            <span className="text-main-1">PlayStation</span> — Meilleures ventes
          </span>
        </h3>
      </Link>
      <div className="nk-gap" />
      <div className="nk-blog-grid">
        <div className="row">
          {games.map(game => {
            const promo = getPromo(game.retail, game.price);
            const price = parseFloat(game.price);
            const path  = `/store/${game.id}/0/${cleanTitle(game.name)}`;
            return (
              <div className="col-md-6 col-lg-4" key={game.id}>
                <div className="nk-blog-post">
                  <Link to={path} className="nk-post-img">
                    <img
                      src={game.img}
                      alt={game.name}
                      className="img-fluid"
                      style={{ width: "100%", objectFit: "cover" }}
                    />
                    {promo && (
                      <span className="nk-post-comments-count">{promo}</span>
                    )}
                    <span className="nk-post-categories">
                      <span className="bg-main-5">{game.type}</span>
                    </span>
                  </Link>
                  <div className="nk-gap" />
                  <span className="nk-post-title h4">
                    <Link to={path}>
                      {game.name.length > 22 ? game.name.slice(0, 22) + "…" : game.name}
                    </Link>
                  </span>
                  <div className="nk-gap" />
                  <div className="d-flex justify-content-between text-white">
                    <span>{price ? `${price.toFixed(2)} €` : "N/A"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PlaystationTendances;