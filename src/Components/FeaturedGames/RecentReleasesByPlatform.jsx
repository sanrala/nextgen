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

function parseDate(dateStr) {
  if (!dateStr || dateStr === "sorti") return new Date(0);
  // Format français : "30 Avril 2026", "19 novembre 2026", "26 février 2026" etc.
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
  // Regex large pour capturer les mois accentués
  const frMatch = dateStr.match(/(\d{1,2})\s+([\wéèêëàâùûüîïôœç]+)\s+(\d{4})/i);
  if (frMatch) {
    const monthAccented = frMatch[2].toLowerCase();
    const monthStripped = monthAccented.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const month = FR_MONTHS[monthAccented] ?? FR_MONTHS[monthStripped];
    if (month !== undefined) {
      return new Date(parseInt(frMatch[3]), month, parseInt(frMatch[1]));
    }
  }
  // Fallback formats ISO
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

const PLATFORM_LABELS = {
  PlayStation: "PlayStation",
  Nintendo:    "Nintendo",
  Xbox:        "Xbox",
};

function RecentReleasesByPlatform({ platform, maxItems = 6 }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Récupère les jeux marqués comme sortis (featured=false mais avec releasedAt)
        const snap = await getDocs(query(
          collection(db, "games"),
          where("featured", "==", false)
        ));
        const all = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        console.log("RecentReleases all docs:", all.length, all.map(g => ({ docId: g.docId, releasedAt: g.releasedAt, featuredPlatforms: g.featuredPlatforms, featured: g.featured })));

        const today = new Date();
        console.log("Today:", today);
        all.forEach(g => {
          const platforms = g.featuredPlatforms?.length > 0 ? g.featuredPlatforms : [];
          const includesPlatform = platforms.includes(platform);
          const d = parseDate(g.releasedAt);
          const isPast = g.releasedAt === "sorti" || (d && d <= today);
          console.log(`${g.docId}: releasedAt=${g.releasedAt} parsed=${d} isPast=${isPast} includesPlatform=${includesPlatform} platform=${platform}`);
        });

        const filtered = all
          .filter(g => {
            // Doit avoir releasedAt
            if (!g.releasedAt) return false;
            // Vérifier que le jeu concernait cette plateforme
            const platforms = g.featuredPlatforms?.length > 0
              ? g.featuredPlatforms
              : [g.featuredPlatform || ""];
            if (!platforms.includes(platform) && !platforms.includes("Tous")) return false;
            // Date de sortie passée ou "sorti"
            if (g.releasedAt === "sorti") return true;
            const d = parseDate(g.releasedAt);
            return d && d <= today;
          })
          .sort((a, b) => {
            const da = parseDate(a.releasedAt) || new Date(0);
            const db2 = parseDate(b.releasedAt) || new Date(0);
            return db2 - da; // plus récent en premier
          })
          .slice(0, maxItems);

        setGames(filtered);
      } catch (e) {
        console.error(`RecentReleases ${platform} error:`, e);
      } finally {
        setLoading(false);
      }
    })();
  }, [platform, maxItems]);

  if (loading || games.length === 0) return null;

  return (
    <div>
      <div className="nk-gap-2" />
      <h3 className="nk-decorated-h-2">
        <span>
          <span className="text-main-1">{PLATFORM_LABELS[platform] || platform}</span>
          {" "}— Dernières sorties
        </span>
      </h3>
      <div className="nk-gap" />
      <div className="nk-blog-grid">
        <div className="row">
          {games.map(game => {
            const fg    = game.featuredGame || {};
            const igId  = fg.id || game.docId?.replace("ig_", "");
            const name  = fg.name || "";
            const img   = fg.img || game.steamData?.header_image || "";
            const price  = parseFloat(fg.price || 0);
            const retail = parseFloat(fg.retail || 0);
            const promo  = getPromo(retail, price);
            const path   = `/store/${igId}/0/${cleanTitle(name)}`;

            return (
              <div className="col-md-6 col-lg-4" key={igId}>
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
                    <span className="preco__date">📅 {game.releasedAt}</span>
                    <span>{price > 0 ? `${price.toFixed(2)} €` : "N/A"}</span>
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

export default RecentReleasesByPlatform;