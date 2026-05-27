import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectUser } from "./../../features/userSlice";

const API_URL = "https://api.sm-artweb.fr/api/topsellers-recent";

function LastPosts() {
  // const user = useSelector(selectUser);
  const [igGames, setIgGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { "User-Agent": "IG-ExportCatalog-Fetcher" },
        });
        const data = await response.json();

        // const topsellers = data
        //   .filter((game) => game.topseller === 1 && game.stock === 1)
        //   .slice(0, 6);

        setIgGames(data);
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

        <div className="nk-gap"></div>
        <div className="nk-blog-grid">
          <div className="row">

            {loading && (
              <div className="col-12 text-center">
                <p>Chargement des tendances...</p>
              </div>
            )}

            {!loading && igGames.length === 0 && (
              <div className="col-12 text-center">
                <p style={{ color: "#aaa" }}>Aucun jeu trouvé.</p>
              </div>
            )}

            {!loading && igGames.map((game) => {
              const promo = getPromo(game.retail, game.price);
              const price = parseFloat(game.price);
              return (
                <div className="col-md-6 col-lg-4" key={game.id}>
                  <div className="nk-blog-post">
                    <div className="nk-gap"></div>

                    <Link
                      to={`/PC/${game.id}/${cleanTitle(game.name)}`}
                      className="nk-post-img"
                    >
                      <img src={game.img} alt={game.name} className="img-fluid" />
                      {promo && (
                        <span className="nk-post-comments-count">{promo}</span>
                      )}
                      <span className="nk-post-categories">
                        <span className="bg-main-5">{game.type}</span>
                      </span>
                    </Link>

                    <div className="nk-gap"></div>
                    <div className="title_price d-flex justify-content-between align-items-baseline">
                      <h2 className="nk-post-title h4">
                        <Link to={`/PC/${game.id}/${cleanTitle(game.name)}`}>
                          {game.name}
                        </Link>
                      </h2>
                      <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                        {promo && <span className="priceSlidePromo">{promo}</span>}
                        <span className="price">
                          {price ? `${price.toFixed(2)}€` : "N/A"}
                        </span>
                      </div>
                    </div>

                    {game.region && (
                      <p style={{ color: "#aaa", fontSize: "0.8rem", margin: "4px 0 0" }}>
                        🌍 {game.region}
                      </p>
                    )}

                    <div className="nk-gap"></div>
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

export default LastPosts;