import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
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

function getReleaseDate(game, platform) {
  const byPlatform = game.release_date?.byPlatform || game.steamData?.release_date?.byPlatform;
  if (byPlatform) return byPlatform[platform] || "";
  return game.release_date?.date || game.steamData?.release_date?.date || "";
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === "Date inconnue") return null;
  const FR_MONTHS = {
    janvier: 0, janv: 0,
    fevrier: 1, février: 1, fev: 1, févr: 1,
    mars: 2,
    avril: 3, avr: 3,
    mai: 4,
    juin: 5,
    juillet: 6, juil: 6,
    aout: 7, août: 7,
    septembre: 8, sept: 8,
    octobre: 9, oct: 9,
    novembre: 10, nov: 10,
    decembre: 11, décembre: 11, dec: 11, déc: 11
  };
  const frMatch = dateStr.match(/(\d{1,2})\s+([\wéèêëàâùûüîïôœç]+)\s+(\d{4})/i);
  if (frMatch) {
    const monthAccented = frMatch[2].toLowerCase();
    const monthStripped = monthAccented.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const month = FR_MONTHS[monthAccented] ?? FR_MONTHS[monthStripped];
    if (month !== undefined) return new Date(parseInt(frMatch[3]), month, parseInt(frMatch[1]));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function isReleased(dateStr) {
  if (!dateStr || dateStr === "Date inconnue" || dateStr === "") return false;
  const parsed = parseDate(dateStr);
  if (!parsed) return false;
  return parsed <= new Date();
}

const PLATFORM_LABELS = {
  PlayStation: "PlayStation",
  Nintendo:    "Nintendo",
  Xbox:        "Xbox",
  PC:          "PC",
  Tous:        "Toutes plateformes",
};

const SLIDER_STYLE = `
  .featured-mobile-slider { display: none; }
  .featured-desktop-grid  { display: block; }
  @media (max-width: 767px) {
    .featured-mobile-slider {
      display: block;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .featured-mobile-slider::-webkit-scrollbar { display: none; }
    .featured-mobile-slider-inner {
      display: flex;
      gap: 12px;
      padding: 0 4px 8px;
    }
    .featured-mobile-slider-card {
      flex: 0 0 75vw;
      max-width: 280px;
      scroll-snap-align: start;
    }
    .featured-desktop-grid { display: none; }
  }
`;

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

        const filtered = [];
        for (const g of all) {
          const platforms = g.featuredPlatforms?.length > 0
            ? g.featuredPlatforms
            : [g.featuredPlatform || "Tous"];
          if (!platforms.includes(platform) && !platforms.includes("Tous")) continue;

          const releaseDate = getReleaseDate(g, platform);
          if (isReleased(releaseDate)) {
            try {
              await setDoc(doc(db, "games", g.docId), {
                featured: false,
                featuredPlatforms: [],
                releasedAt: releaseDate,
              }, { merge: true });
            } catch (e) {
              console.warn("Firebase unfeatured error:", e);
            }
            continue;
          }
          filtered.push(g);
        }
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
      <style>{SLIDER_STYLE}</style>
      <div className="nk-gap-2" />
      <Link to={`/Catalogues?catFilter=upcoming&platform=${platform === "PC" ? "Steam" : platform}`}>
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">{PLATFORM_LABELS[platform] || platform}</span>
            {" "}— Sorties les plus attendues
          </span>
        </h3>
      </Link>
      <div className="nk-gap" />

      {/* ── Mobile slider ── */}
      <div className="featured-mobile-slider">
        <div className="featured-mobile-slider-inner">
          {games.slice(0, maxItems).map(game => {
            const fg = game.featuredGame || {};
            const igId = fg.id || game.docId?.replace("ig_", "");
            const name = fg.name || "";
            const img = fg.img || game.steamData?.header_image || "";
            const price = parseFloat(fg.price || 0);
            const retail = parseFloat(fg.retail || 0);
            const promo = getPromo(retail, price);
            const path = `/store/${igId}/0/${cleanTitle(name)}`;
            const releaseDate = getReleaseDate(game, platform);
            return (
              <div className="featured-mobile-slider-card" key={igId}>
                <div className="nk-blog-post">
                  <Link to={path} className="nk-post-img" onClick={() => window.scrollTo(0, 0)}>
                    <img src={img} alt={name} className="img-fluid" style={{ width: "100%", objectFit: "cover" }} />
                    {promo && <span className="nk-post-comments-count">{promo}</span>}
                  </Link>
                  <div className="nk-gap" />
                  <span className="nk-post-title h4">
                    <Link to={path} onClick={() => window.scrollTo(0, 0)}>
                      {name.length > 22 ? name.slice(0, 22) + "…" : name}
                    </Link>
                  </span>
                  <div className="nk-gap" />
                  <div className="d-flex justify-content-between text-white">
                    <span className="preco__date">{releaseDate ? `📅 ${releaseDate}` : "📅 Date à confirmer"}</span>
                    <span>{price > 0 ? `${price.toFixed(2)} €` : "À venir"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Desktop grid ── */}
      <div className="featured-desktop-grid">
        <div className="nk-blog-grid">
          <div className="row">
            {games.slice(0, maxItems).map(game => {
              const fg     = game.featuredGame || {};
              const igId   = fg.id || game.docId?.replace("ig_", "");
              const name   = fg.name || "";
              const img    = fg.img || game.steamData?.header_image || "";
              const type   = fg.type || platform;
              const price  = parseFloat(fg.price || 0);
              const retail = parseFloat(fg.retail || 0);
              const promo  = getPromo(retail, price);
              const path   = `/store/${igId}/0/${cleanTitle(name)}`;
              const releaseDate = getReleaseDate(game, platform);
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
                      <span className="preco__date">{releaseDate ? `📅 ${releaseDate}` : "📅 Date à confirmer"}</span>
                      <span>{price > 0 ? `${price.toFixed(2)} €` : "À venir"}</span>
                    </div>
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

export default FeaturedGamesByPlatform;