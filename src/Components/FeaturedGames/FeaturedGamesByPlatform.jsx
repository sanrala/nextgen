import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Firebase";

function cleanTitle(name) {
  return (name || "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

function getPromo(retail, price) {
  const r = parseFloat(retail);
  const p = parseFloat(price);
  if (!r || !p || r <= p) return null;
  return `-${Math.round(((r - p) / r) * 100)}%`;
}

const PLATFORM_LABELS = {
  PlayStation: "PlayStation",
  Nintendo:    "Nintendo",
  Xbox:        "Xbox",
  PC:          "PC",
  Tous:        "Toutes plateformes",
};

function FeaturedGamesByPlatform({ platform, maxItems = 6 }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, "games"),
          where("featured", "==", true)
        ));
        const all = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        // Filtre uniquement la plateforme demandée
        const filtered = all.filter(g => {
          const platforms = g.featuredPlatforms?.length > 0
            ? g.featuredPlatforms
            : [g.featuredPlatform || "Tous"];
          return platforms.includes(platform) || platforms.includes("Tous");
        });
        setGames(filtered);
      } catch (e) {
        console.error(`FeaturedGames ${platform} error:`, e);
      } finally {
        setLoading(false);
      }
    })();
  }, [platform]);

  if (loading || games.length === 0) return null;

  return (
    <div>
      <div className="nk-gap-2" />
      <h3 className="nk-decorated-h-2">
        <span>
          <span className="text-main-1">{PLATFORM_LABELS[platform] || platform}</span>
          {" "}— Sorties les plus attendues
        </span>
      </h3>
      <div className="nk-gap" />
      <div className="nk-blog-grid">
        <div className="row">
          {games.slice(0, maxItems).map(game => {
            const fg    = game.featuredGame || {};
            const igId  = fg.id || game.docId?.replace("ig_", "");
            const name  = fg.name || "";
            const img   = fg.img || game.steamData?.header_image || "";
            const type  = fg.type || platform;
            const price  = parseFloat(fg.price || 0);
            const retail = parseFloat(fg.retail || 0);
            const promo  = getPromo(retail, price);
            const path   = `/store/${igId}/0/${cleanTitle(name)}`;
            const releaseDate = (() => {
              const byPlatform = game.release_date?.byPlatform || game.steamData?.release_date?.byPlatform;
              if (byPlatform) return byPlatform[platform] || "";
              return game.release_date?.date || game.steamData?.release_date?.date || "";
            })();

            return (
              <div className="col-md-6 col-lg-4" key={igId}>
                <div className="nk-blog-post">
                  <Link to={path} className="nk-post-img" onClick={() => window.scrollTo(0, 0)}>
                    <img src={img} alt={name} className="img-fluid" style={{ width: "100%", objectFit: "cover" }} />
                    {promo && <span className="nk-post-comments-count">{promo}</span>}
                    <span className="nk-post-categories">
                      <span className="bg-main-5">{type}</span>
                    </span>
                  </Link>
                  <div className="nk-gap" />
                  <span className="nk-post-title h4">
                    <Link to={path} onClick={() => window.scrollTo(0, 0)}>
                      {name.length > 22 ? name.slice(0, 22) + "…" : name}
                    </Link>
                  </span>
                  <div className="nk-gap" />
                  <div className="d-flex justify-content-between text-white">
                    <span className="preco__date">
                      {releaseDate ? `📅 ${releaseDate}` : "📅 Date à confirmer"}
                    </span>
                    <span>{price > 0 ? `${price.toFixed(2)} €` : "À venir"}</span>
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

export default FeaturedGamesByPlatform;
