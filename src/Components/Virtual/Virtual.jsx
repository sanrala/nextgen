import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://api.sm-artweb.fr/api/steam-vr";

const SLIDER_STYLE = `
  .vr-mobile-slider {
    display: none;
  }
  .vr-desktop-grid {
    display: block;
  }
  @media (max-width: 767px) {
    .vr-mobile-slider {
      display: block;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .vr-mobile-slider::-webkit-scrollbar { display: none; }
    .vr-mobile-slider-inner {
      display: flex;
      gap: 12px;
      padding: 0 4px 8px;
    }
    .vr-mobile-slider-card {
      flex: 0 0 75vw;
      max-width: 280px;
      scroll-snap-align: start;
    }
    .vr-desktop-grid {
      display: none;
    }
  }
`;

function Virtual() {
  const [igGames, setIgGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { "User-Agent": "IG-ExportCatalog-Fetcher" },
        });
        const data = await response.json();

        if (!data || data.length === 0) {
          setIgGames([]);
          setLoading(false);
          return;
        }

        const uniqueGames = Object.values(
          data.reduce((acc, game) => {
            const key = game.name
              .toLowerCase()
              .replace(/deluxe|ultimate|gold|premium|standard/gi, "")
              .replace(/\s+/g, " ")
              .trim()
              .split(" ")
              .slice(0, 3)
              .join(" ");
            if (!acc[key]) {
              acc[key] = game;
            } else {
              if (parseFloat(game.price) < parseFloat(acc[key].price)) {
                acc[key] = game;
              }
            }
            return acc;
          }, {})
        );

        const filtered = uniqueGames.filter(game => {
          const region = (game.region || "").toLowerCase();
          if (region.includes("latin")) return false;
          if (region.includes("us") && !region.includes("europe") && !region.includes("australia")) return false;
          return true;
        });

        setIgGames(filtered.slice(0, 6));
      } catch (error) {
        console.error("Erreur fetch Virtual :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const cleanTitle = (title) =>
    title.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");

  const getPromo = (retail, price) => {
    const r = parseFloat(retail);
    const p = parseFloat(price);
    if (!r || !p || r <= p) return null;
    return `-${Math.round(((r - p) / r) * 100)}%`;
  };

  return (
    <div className="row vertical-gap">
      <style>{SLIDER_STYLE}</style>
      <div className="col-lg-12">
        <Link to="/Catalogues">
          <h3 className="nk-decorated-h-2">
            <span>
              <span className="text-main-1">Jeux</span> VR
            </span>
          </h3>
        </Link>
        <div className="nk-gap" />

        {/* ── Mobile slider ── */}
        <div className="vr-mobile-slider">
          <div className="vr-mobile-slider-inner">
            {!loading && igGames.map((game) => {
              const promo = getPromo(game.retail, game.price);
              const price = parseFloat(game.price);
              const detailPath = `/store/${game.id}/${game.steam_id || 0}/${cleanTitle(game.name)}`;
              return (
                <div className="vr-mobile-slider-card" key={game.id}>
                  <div className="nk-blog-post">
                    <Link to={detailPath} className="nk-post-img">
                      <img src={game.img} alt={game.name} style={{ width: "100%", objectFit: "cover" }} />
                      {promo && <span className="nk-post-comments-count">{promo}</span>}
                    </Link>
                    <div className="nk-gap" />
                    <h2 className="nk-post-title h4">
                      <Link to={detailPath}>{game.name.length > 22 ? game.name.slice(0, 22) + "…" : game.name}</Link>
                    </h2>
                    <div className="nk-gap" />
                    <div>🥽 VR</div>
                    <span>{price ? `${price.toFixed(2)} €` : "N/A"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Desktop grid ── */}
        <div className="vr-desktop-grid">
          <div className="nk-blog-grid">
            <div className="row">
              {loading && <p>Chargement...</p>}
              {!loading && igGames.map((game) => {
                const promo = getPromo(game.retail, game.price);
                const price = parseFloat(game.price);
                const detailPath = `/store/${game.id}/${game.steam_id || 0}/${cleanTitle(game.name)}`;
                return (
                  <div className="col-md-6 col-lg-4" key={game.id}>
                    <div className="nk-blog-post">
                      <Link to={detailPath} className="nk-post-img">
                        <img src={game.img} alt={game.name} />
                        {promo && <span className="nk-post-comments-count">{promo}</span>}
                      </Link>
                      <div className="nk-gap" />
                      <h2 className="nk-post-title h4">
                        <Link to={detailPath}>{game.name}</Link>
                      </h2>
                      <div className="nk-gap" />
                      <div>🥽 VR</div>
                      <span>{price ? `${price.toFixed(2)} €` : "N/A"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Virtual;
