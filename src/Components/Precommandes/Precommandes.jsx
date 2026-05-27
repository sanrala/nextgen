import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Precommandes() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrecommandes = async () => {
      try {
        // ✅ ON UTILISE DIRECT TON BACKEND
        const response = await fetch("https://api.sm-artweb.fr/api/precommandes");
        const data = await response.json();
// t
        setGames(data.slice(0, 6)); // limite à 6
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
      <div className="nk-gap-2"></div>

      <Link to={{ pathname: `/PrecoFull/` }}>
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

      {!loading && (
        <div className="nk-blog-grid">
          <div className="row">
            {games.map((game) => {
              const promo = getPromo(game.retail, game.price);
              const price = parseFloat(game.price);

              return (
                <div className="col-md-6 col-lg-4" key={game.id}>
                  <div className="nk-blog-post">

                    <Link
                      to={`/PC/${game.id}/${cleanTitle(game.name)}`}
                      className="nk-post-img"
                    >
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

                    <div className="nk-gap"></div>

                    <span className="nk-post-title h4">
                      <Link to={`/PC/${game.id}/${cleanTitle(game.name)}`}>
                        {game.name.length > 17
                          ? game.name.slice(0, 17) + "..."
                          : game.name}
                      </Link>
                    </span>

                    <div className="nk-gap"></div>

                    <div className="d-flex justify-content-between text-white">
                      <div>
                        <span className="preco">PRECO</span>{" "}
                        <span className="preco__date">
                          {game.releaseDate
                            ? `📅 ${game.releaseDate}`
                            : `🌍 ${game.region}`}
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
      )}
    </div>
  );
}

export default Precommandes;