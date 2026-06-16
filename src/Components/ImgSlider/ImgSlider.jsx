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

function ImgSlider() {
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
        if (games[0]) setGameData(games[0]);
      } catch (e) {
        console.error("ImgSlider fetch error:", e);
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

    setGameInfo({
      id: gameData.id,
      title: gameData.name,
      price: `${parseFloat(gameData.price).toFixed(2)} €`,
      promo:
        gameData.retail && gameData.price
          ? `-${Math.round(
              ((parseFloat(gameData.retail) - parseFloat(gameData.price)) /
                parseFloat(gameData.retail)) *
                100
            )}%`
          : "",
      buy: gameData.url,
    });

    const resolveHero = async () => {
      const checkImg = async (url) => {
        try {
          const r = await fetch(`${PROXY}/api/check-image?url=${encodeURIComponent(url)}`);
          const { ok } = await r.json();
          return ok;
        } catch { return false; }
      };

      try {
        if (gameData.steam_id) {
          const heroUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/library_hero.jpg`;
          if (await checkImg(heroUrl)) { setHeroUrl(heroUrl); return; }
        }

        let steamAppId = gameData.steam_id || null;
        try {
          const { initializeApp, getApps } = await import("firebase/app");
          const { getFirestore, doc, getDoc } = await import("firebase/firestore");
          const firebaseConfig = {
            apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
            authDomain: "nextgen-d1ff5.firebaseapp.com",
            projectId: "nextgen-d1ff5",
          };
          const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
          const db = getFirestore(app);
          const snap = await getDoc(doc(db, "games", `ig_${gameData.id}`));
          if (snap.exists()) {
            const fbData = snap.data();
            const appId = fbData?.steamData?.steam_appid;
            if (appId) steamAppId = appId;

            if (appId && appId !== gameData.steam_id) {
              const heroFb = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`;
              if (await checkImg(heroFb)) { setHeroUrl(heroFb); return; }
            }

            const fbScreenshots = fbData?.steamData?.screenshots || [];
            if (fbScreenshots.length > 0) {
              setHeroUrl(fbScreenshots[0].path_full || fbScreenshots[0].path_thumbnail);
              return;
            }
          }
        } catch {}

        if (steamAppId) {
          try {
            const res = await fetch(`${PROXY}/api/steam/${steamAppId}`);
            if (res.ok) {
              const data = await res.json();
              const screenshots = data?.screenshots || [];
              if (screenshots.length > 0) {
                setHeroUrl(screenshots[0].path_full || screenshots[0].path_thumbnail);
                return;
              }
            }
          } catch {}
        }

        if (steamAppId) {
          const header = `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/header.jpg`;
          if (await checkImg(header)) { setHeroUrl(header); return; }
        }

        setHeroUrl(null);
      } catch (e) {
        setHeroUrl(null);
      }
    };

    resolveHero();
  }, [gameData]);

  if (!gameInfo || !heroUrl) return null;

  const slug = gameInfo.title.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");

  return (
    <Link
      to={`/store/${gameInfo.id}/0/${slug}`}
      style={{ display: "block", textDecoration: "none" }}
    >
      <div
        style={{
          backgroundImage: `url(${heroUrl})`,
          backgroundSize: "cover",
          backgroundPosition: isMobile ? "center center" : "center top",
          ...(isMobile
            ? { minHeight: "220px", aspectRatio: "16 / 5" }
            : { height: "600px" }),
          position: "relative",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Dégradé gauche */}
        <div style={{
          position: "absolute", inset: 0,
          background: isMobile
            ? "linear-gradient(to right, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0.3) 70%, transparent 100%)"
            : "linear-gradient(to right, rgba(0,0,0,0.9) 20%, transparent 60%)",
        }} />
        {/* Dégradé bas */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(23,30,34,1) 0%, transparent 40%)",
        }} />

        {isMobile ? (
          <div style={{
            position: "relative",
            zIndex: 1,
            padding: "0 16px",
            maxWidth: "72%",
          }}>
            {/* Titre */}
            <span style={{
              display: "block",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(13px, 3.8vw, 18px)",
              color: "#ffffff",
              lineHeight: 1.3,
              marginBottom: "8px",
            }}>
              {gameInfo.title}
            </span>

            {/* Badge promo + Prix */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {gameInfo.promo && (
                <span style={{
                  display: "inline-block",
                  background: "#dd163b",
                  color: "#fff",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  flexShrink: 0,
                }}>
                  {gameInfo.promo}
                </span>
              )}
              <span style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(22px, 6vw, 32px)",
                color: "#ffffff",
                lineHeight: 1,
              }}>
                {gameInfo.price}
              </span>
            </div>
          </div>
        ) : (
          <div style={{
            position: "relative",
            zIndex: 1,
            padding: "0 100px",
            maxWidth: "700px",
          }}>
            {/* Titre */}
            <span style={{
              display: "block",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(18px, 2.5vw, 32px)",
              color: "#ffffff",
              lineHeight: 1.3,
              marginBottom: "14px",
            }}>
              {gameInfo.title}
            </span>

            {/* Badge promo + Prix */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {gameInfo.promo && (
                <span style={{
                  display: "inline-block",
                  background: "#dd163b",
                  color: "#fff",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: "16px",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  flexShrink: 0,
                }}>
                  {gameInfo.promo}
                </span>
              )}
              <span style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 4vw, 52px)",
                color: "#ffffff",
                lineHeight: 1,
              }}>
                {gameInfo.price}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default ImgSlider;