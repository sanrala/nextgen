import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://api.sm-artweb.fr/api/topsellers-recent";

function Popular() {
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

        // 1. Dédoublonnage par nom (garde le moins cher)
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

        // 2. Tri par date de sortie (plus récent d'abord)
        const sorted = uniqueGames.sort((a, b) => {
          const getYear = (d) => {
            if (!d || typeof d !== "string") return 0;
            const match = d.match(/\d{4}/);
            return match ? parseInt(match[0]) : 0;
          };
          return getYear(b.releaseDate) - getYear(a.releaseDate);
        });

        setIgGames(sorted.slice(0, 6));
      } catch (error) {
        console.error("Erreur fetch Popular :", error);
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
      <div className="col-lg-12">
        <Link to="/Populaires/">
          <h3 className="nk-decorated-h-2">
            <span>
              <span className="text-main-1">Tendances</span> Récentes
            </span>
          </h3>
        </Link>

        <div className="nk-gap" />

        <div className="nk-blog-grid">
          <div className="row">
            {loading && <p>Chargement...</p>}

            {!loading &&
              igGames.map((game) => {
                const promo = getPromo(game.retail, game.price);
                const price = parseFloat(game.price);

                // 🔑 Lien vers GameDetail avec igId + steamId + title
                const detailPath = `/store/${game.id}/${game.steam_id || 0}/${cleanTitle(game.name)}`;

                return (
                  <div className="col-md-6 col-lg-4" key={game.id}>
                    <div className="nk-blog-post">

                      <Link to={detailPath} className="nk-post-img">
                        <img src={game.img} alt={game.name} />
                        {promo && (
                          <span className="nk-post-comments-count">{promo}</span>
                        )}
                      </Link>

                      <div className="nk-gap" />

                      <h2 className="nk-post-title h4">
                        <Link to={detailPath}>{game.name}</Link>
                      </h2>

                      <div className="nk-gap" />

                      <div>
                        {game.releaseDate
                          ? `📅 ${game.releaseDate}`
                          : `🌍 ${game.region}`}
                      </div>

                      <span>{price ? `${price.toFixed(2)} €` : "N/A"}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popular;