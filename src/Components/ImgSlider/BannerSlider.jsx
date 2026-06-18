import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase";

const PROXY = "https://api.sm-artweb.fr";

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

function BannerSlider() {
  const [gameData, setGameData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [heroUrl, setHeroUrl] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        // 1. Lire la config admin (sliders/config)
        const configSnap = await getDoc(doc(db, "sliders", "config"));
        if (configSnap.exists() && configSnap.data().bannerSlider?.igId) {
          const cfg = configSnap.data().bannerSlider;
          try {
            const gSnap = await getDoc(doc(db, "games", `ig_${cfg.igId}`));
            const gData = gSnap.exists() ? gSnap.data() : {};
            const editions = gData.editions || [];
            const ed = editions.find(e => e.stock === 1 && parseFloat(e.price) > 0) || editions[0] || {};

            const releaseDate = cfg.releaseDate
              || gData.steamData?.release_date?.date
              || gData.release_date?.date
              || ed.releaseDate
              || null;

            setGameData({
              id:       cfg.igId,
              name:     cfg.name,
              img:      cfg.img,
              price:    ed.price || "0.00",
              retail:   ed.retail || "0.00",
              steam_id: gData.steamData?.steam_appid || cfg.steam_id || 0,
              releaseDate,
              customCover: cfg.customCover || null,
            });
          } catch {
            setGameData({ id: cfg.igId, name: cfg.name, img: cfg.img,
              price: "0.00", retail: "0.00", steam_id: cfg.steam_id || 0 });
          }
          return;
        }

        // 2. Fallback : deuxième jeu trending sorti
        const snap = await getDocs(query(collection(db, "games"), where("trending", "==", true)));
        const today = new Date(); today.setHours(0,0,0,0);
        const games = snap.docs
          .map(d => ({ docId: d.id, ...d.data() }))
          .filter(g => {
            if (!g.trendingGame) return false;
            const rd = parseRelease(g.release_date?.date || g.steamData?.release_date?.date || "");
            return rd && rd <= today;
          })
          .map(g => {
            const ed = (g.editions || []).find(e => e.stock === 1 && parseFloat(e.price) > 0) || (g.editions || [])[0] || {};
            return {
              id: g.trendingGame.id, name: g.trendingGame.name, img: g.trendingGame.img,
              price: ed.price || "0.00", retail: ed.retail || "0.00",
              steam_id: g.steamData?.steam_appid || ed.steam_id || 0,
              releaseDate: g.release_date?.date || ed.releaseDate || null,
            };
          })
          .sort((a, b) => {
            const da = parseRelease(a.releaseDate), db2 = parseRelease(b.releaseDate);
            if (!da && !db2) return 0; if (!da) return 1; if (!db2) return -1;
            return db2 - da;
          });
        if (games[1]) setGameData(games[1]);
      } catch (e) { console.error("BannerSlider fetch error:", e); }
    };
    fetchGame();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!gameData) return;
    const slug = gameData.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
    const releaseDate = gameData.releaseDate || null;
    const releaseObj  = parseRelease(releaseDate);
    const today       = new Date(); today.setHours(0,0,0,0);
    const isPreco     = releaseObj ? releaseObj > today : false;

    setGameInfo({
      id:    gameData.id,
      title: gameData.name,
      price: `${parseFloat(gameData.price || 0).toFixed(2)} €`,
      promo: gameData.retail && gameData.price && parseFloat(gameData.retail) > parseFloat(gameData.price)
        ? `-${Math.round(((parseFloat(gameData.retail) - parseFloat(gameData.price)) / parseFloat(gameData.retail)) * 100)}%`
        : "",
      isPreco,
      releaseDate,
      buy:  gameData.url,
      slug,
    });
    const steamHero = `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/library_hero.jpg`;
    if (gameData.customCover) { setHeroUrl(gameData.customCover); return; }
    (async () => {
      try {
        const check = await fetch(`${PROXY}/api/check-image?url=${encodeURIComponent(steamHero)}`);
        const { ok } = await check.json();
        setHeroUrl(ok ? steamHero : gameData.img);
      } catch {
        setHeroUrl(gameData.img);
      }
    })();
  }, [gameData]);

  if (!gameInfo || !heroUrl) return null;

  const PriceBlock = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 10 }}>
      {gameInfo.isPreco ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center",
              background: "#dd163b", color: "#fff",
              fontFamily: "'Orbitron', sans-serif", fontWeight: 700,
              fontSize: isMobile ? "9px" : "9px",
              letterSpacing: "1.5px",
              padding: isMobile ? "4px 8px" : "5px 10px",
              borderRadius: "3px", flexShrink: 0,
            }}>
              PRÉCO
            </span>
            {gameInfo.releaseDate && (
              <span style={{
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 600,
                fontSize: isMobile ? "12px" : "14px",
                color: "rgba(255,255,255,0.6)", letterSpacing: "0.5px",
              }}>
                {gameInfo.releaseDate}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
              fontSize: isMobile ? "clamp(24px, 6vw, 32px)" : "clamp(28px, 3.5vw, 42px)",
              color: "#fff", lineHeight: 1, letterSpacing: "-1px",
            }}>
              {gameInfo.price}
            </span>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 600,
              fontSize: isMobile ? "10px" : "11px",
              color: "rgba(255,255,255,0.35)", letterSpacing: "1px",
              textTransform: "uppercase", paddingBottom: 3,
            }}>
              Prix préco
            </span>
          </div>
        </>
      ) : (
        <>
          {gameInfo.promo && (
            <span style={{
              display: "inline-flex", alignItems: "center",
              background: "#dd163b", color: "#fff",
              fontFamily: "'Orbitron', sans-serif", fontWeight: 700,
              fontSize: "9px", letterSpacing: "1.5px",
              padding: isMobile ? "4px 8px" : "5px 10px",
              borderRadius: "3px", width: "fit-content",
            }}>
              {gameInfo.promo}
            </span>
          )}
          <span style={{
            fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
            fontSize: isMobile ? "clamp(22px, 6vw, 30px)" : "clamp(26px, 3.5vw, 40px)",
            color: "#fff", lineHeight: 1, letterSpacing: "-1px",
          }}>
            {gameInfo.price}
          </span>
        </>
      )}
    </div>
  );

  return (
    <Link
      to={`/store/${gameInfo.id}/0/${gameInfo.slug}`}
      style={{ display: "block", textDecoration: "none" }}
    >
      <div style={{
        backgroundImage: `url(${heroUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        width: "100%",
        height: isMobile ? "180px" : "380px",
      }}>
        {/* Dégradé gauche */}
        <div style={{
          position: "absolute", inset: 0,
          background: isMobile
            ? "linear-gradient(to right, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0.3) 70%, transparent 100%)"
            : "linear-gradient(to right, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.4) 55%, transparent 100%)",
        }} />
        {/* Dégradé bas */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(23,30,34,1) 0%, transparent 50%)",
        }} />
        <div style={{
          position: "relative", zIndex: 1,
          padding: isMobile ? "0 16px" : "0 60px",
          maxWidth: isMobile ? "72%" : "600px",
        }}>
          <span style={{
            display: "block",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? "clamp(13px, 3.8vw, 18px)" : "clamp(16px, 2vw, 24px)",
            color: "#ffffff",
            lineHeight: 1.3,
            marginBottom: isMobile ? "8px" : "12px",
          }}>
            {gameInfo.title}
          </span>
          <PriceBlock />
        </div>
      </div>
    </Link>
  );
}

export default BannerSlider;