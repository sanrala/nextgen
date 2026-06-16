import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
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
    const fetchTrending = async () => {
      try {
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
              id: g.trendingGame.id,
              name: g.trendingGame.name,
              img: g.trendingGame.img,
              type: g.trendingGame.type,
              price: ed.price || "0.00",
              retail: ed.retail || "0.00",
              steam_id: g.steamData?.steam_appid || ed.steam_id || 0,
              region: ed.region || "Europe",
              releaseDate: g.release_date?.date || ed.releaseDate || null,
              stock: 1,
            };
          })
          .sort((a, b) => {
            const da = parseRelease(a.releaseDate);
            const db2 = parseRelease(b.releaseDate);
            if (!da && !db2) return 0;
            if (!da) return 1;
            if (!db2) return -1;
            return db2 - da;
          });
        if (games[1]) setGameData(games[1]);
      } catch (e) {
        console.error("BannerSlider fetch error:", e);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!gameData) return;
    const slug = gameData.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
    setGameInfo({
      id:    gameData.id,
      title: gameData.name,
      price: `${parseFloat(gameData.price).toFixed(2)} €`,
      promo: gameData.retail && gameData.price
        ? `-${Math.round(((parseFloat(gameData.retail) - parseFloat(gameData.price)) / parseFloat(gameData.retail)) * 100)}%`
        : "",
      buy:  gameData.url,
      slug,
    });
    const steamHero = `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/library_hero.jpg`;
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
        minHeight: "220px",
        aspectRatio: "16 / 5",
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
          {/* Titre */}
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

          {/* Badge promo + Prix */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "16px" }}>
            {gameInfo.promo && (
              <span style={{
                display: "inline-block",
                background: "#dd163b",
                color: "#fff",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? "13px" : "16px",
                padding: isMobile ? "4px 8px" : "5px 10px",
                borderRadius: "4px",
                flexShrink: 0,
              }}>
                {gameInfo.promo}
              </span>
            )}
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? "clamp(22px, 6vw, 32px)" : "clamp(28px, 4vw, 48px)",
              color: "#ffffff",
              lineHeight: 1,
            }}>
              {gameInfo.price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BannerSlider;