import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SLIDER_STYLE = `
  .preco-mobile-slider {
    display: none;
  }
  .preco-desktop-grid {
    display: block;
  }
  @media (max-width: 767px) {
    .preco-mobile-slider {
      display: block;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .preco-mobile-slider::-webkit-scrollbar { display: none; }
    .preco-mobile-slider-inner {
      display: flex;
      gap: 12px;
      padding: 0 4px 8px;
    }
    .preco-mobile-slider-card {
      flex: 0 0 75vw;
      max-width: 280px;
      scroll-snap-align: start;
    }
    .preco-desktop-grid {
      display: none;
    }
  }
`;

const FR_MONTHS = {
  janvier:0, janv:0, fevrier:1, février:1, fev:1, mars:2,
  avril:3, avr:3, mai:4, juin:5, juillet:6, juil:6,
  aout:7, août:7, septembre:8, sept:8, octobre:9, oct:9,
  novembre:10, nov:10, decembre:11, décembre:11, dec:11, déc:11
};
function parseRelease(dateStr) {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{1,2})\s+([\wéèêëàâùûüîïôœç]+)\s+(\d{4})/i);
  if (m) {
    const mn = m[2].toLowerCase();
    const mo = FR_MONTHS[mn] ?? FR_MONTHS[mn.normalize("NFD").replace(/[\u0300-\u036f]/g,"")];
    if (mo !== undefined) return new Date(parseInt(m[3]), mo, parseInt(m[1]));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function Precommandes() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrecommandes = async () => {
      try {
        const response = await fetch("https://api.sm-artweb.fr/api/precommandes");
        const data = await response.json();

        const EXCLUDED = ['indies', 'indépendant', 'independant', 'indie', 'occasionnel', 'casual'];

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
          const cats = (game.category || []).map(c => c.toLowerCase());
          if (cats.some(c => EXCLUDED.includes(c))) return false;
          const region = (game.region || "").toLowerCase();
          if (region.includes("latin")) return false;
          if (region.includes("us") && !region.includes("europe") && !region.includes("australia")) return false;
          return true;
        });

        // Normaliser le champ date (releaseDate ou release_date)
        const normalized = filtered.map(g => ({
          ...g,
          releaseDate: g.releaseDate || g.release_date || null,
        }));

        // Trier par date de sortie croissante (la plus proche en premier)
        const sorted = normalized.sort((a, b) => {
          const da = parseRelease(a.releaseDate);
          const db = parseRelease(b.releaseDate);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return da - db;
        });

        setGames(sorted.slice(0, 6));
      } catch (err) {
        console.error("Erreur fetch précommandes :", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrecommandes();
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
    <div>
      <style>{SLIDER_STYLE}</style>
      <div className="nk-gap-2"></div>
      <Link to="/Catalogues?catFilter=preorder">
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">Jeux</span> en précommandes
          </span>
        </h3>
      </Link>
      <div className="nk-gap"></div>
      {loading && <p>Chargement...</p>}
      {!loading && games.length === 0 && (
        <p style={{ color: "#aaa" }}>Aucune précommande disponible.</p>
      )}
      {!loading && games.length > 0 && (
        <>
          {/* ── Mobile slider ── */}
          <div className="preco-mobile-slider">
            <div className="preco-mobile-slider-inner">
              {games.map((game) => {
                const promo = getPromo(game.retail, game.price);
                const price = parseFloat(game.price);
                const detailPath = `/store/${game.id}/${game.steam_id || 0}/${cleanTitle(game.name)}`;
                return (
                  <div className="preco-mobile-slider-card" key={game.id}>
                    <div className="nk-blog-post">
                      <Link to={detailPath} className="nk-post-img">
                        <img src={game.img} alt={game.name} style={{ width: "100%", objectFit: "cover" }} />
                        {promo && <span className="nk-post-comments-count">{promo}</span>}
                        <span className="nk-post-categories">
                          <span className="bg-main-5">{game.type}</span>
                        </span>
                      </Link>
                      <div className="nk-gap"></div>
                      <span className="nk-post-title h4">
                        <Link to={detailPath}>
                          {game.name.length > 17 ? game.name.slice(0, 17) + "..." : game.name}
                        </Link>
                      </span>
                      <div className="nk-gap"></div>
                      <div className="d-flex justify-content-between text-white">
                        <div>
                          <span className="preco">PRECO</span>{" "}
                          <span className="preco__date">
                            {game.releaseDate ? `📅 ${game.releaseDate}` : `🌍 ${game.region}`}
                          </span>
                        </div>
                        <span>{price ? `${price.toFixed(2)}€` : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Desktop grid ── */}
          <div className="preco-desktop-grid">
            <div className="nk-blog-grid">
              <div className="row">
                {games.map((game) => {
                  const promo = getPromo(game.retail, game.price);
                  const price = parseFloat(game.price);
                  const detailPath = `/store/${game.id}/${game.steam_id || 0}/${cleanTitle(game.name)}`;
                  return (
                    <div className="col-md-6 col-lg-4" key={game.id}>
                      <div className="nk-blog-post">
                        <Link to={detailPath} className="nk-post-img">
                          <img src={game.img} alt={game.name} className="img-fluid" style={{ width: "100%", objectFit: "cover" }} />
                          {promo && <span className="nk-post-comments-count">{promo}</span>}
                          <span className="nk-post-categories">
                            <span className="bg-main-5">{game.type}</span>
                          </span>
                        </Link>
                        <div className="nk-gap"></div>
                        <span className="nk-post-title h4">
                          <Link to={detailPath}>
                            {game.name.length > 17 ? game.name.slice(0, 17) + "..." : game.name}
                          </Link>
                        </span>
                        <div className="nk-gap"></div>
                        <div className="d-flex justify-content-between text-white">
                          <div>
                            <span className="preco">PRECO</span>{" "}
                            <span className="preco__date">
                              {game.releaseDate ? `📅 ${game.releaseDate}` : `🌍 ${game.region}`}
                            </span>
                          </div>
                          <span>{price ? `${price.toFixed(2)}€` : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Precommandes;