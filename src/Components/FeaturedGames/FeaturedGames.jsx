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

// Groupe les jeux par plateforme — un jeu peut apparaître dans plusieurs sections
function groupByPlatform(games) {
  const acc = {};
  for (const g of games) {
    const platforms = g.featuredPlatforms?.length > 0
      ? g.featuredPlatforms
      : [g.featuredPlatform || "Tous"];
    for (const p of platforms) {
      if (!acc[p]) acc[p] = [];
      acc[p].push(g);
    }
  }
  return acc;
}

function FeaturedGames() {
  const [groups, setGroups]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Récupère tous les docs Firebase avec featured=true
        const snap = await getDocs(query(
          collection(db, "games"),
          where("featured", "==", true)
        ));

        const games = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        console.log("FeaturedGames data:", JSON.stringify(games.map(g => ({
          docId: g.docId,
          featured: g.featured,
          featuredPlatforms: g.featuredPlatforms,
          release_date: g.steamData?.release_date,
        })), null, 2));
        setGroups(groupByPlatform(games));
      } catch (e) {
        console.error("FeaturedGames fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || Object.keys(groups).length === 0) return null;

  return (
    <>
      {Object.entries(groups).map(([platform, games]) => (
        <div key={platform}>
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
              {games.slice(0, 6).map(game => {
                const fg     = game.featuredGame || {};
                const igId   = fg.id || game.docId?.replace("ig_", "");
                const name   = fg.name || "";
                const img    = fg.img || game.steamData?.header_image || "";
                const type   = fg.type || platform;
                const price  = parseFloat(fg.price || 0);
                const retail = parseFloat(fg.retail || 0);
                const promo  = getPromo(retail, price);
                const path   = `/store/${igId}/0/${cleanTitle(name)}`;
                const releaseDate = (() => {
                  const byPlatform = game.steamData?.release_date?.byPlatform;
                  if (byPlatform) return byPlatform[platform] || "";
                  return game.steamData?.release_date?.date || "";
                })();

                return (
                  <div className="col-md-6 col-lg-4" key={igId}>
                    <div className="nk-blog-post">
                      <Link to={path} className="nk-post-img" onClick={() => window.scrollTo(0, 0)}>
                        <img
                          src={img}
                          alt={name}
                          className="img-fluid"
                          style={{ width: "100%", objectFit: "cover" }}
                        />
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
                        <span>
                          {price > 0 ? `${price.toFixed(2)} €` : "À venir"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="separator product-panel" />
        </div>
      ))}
    </>
  );
}

export default FeaturedGames;