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

function ImgSlider() {
  const [gameData, setGameData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [heroUrl, setHeroUrl] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        // 1. Lire la config admin (sliders/config)
        const configSnap = await getDoc(doc(db, "sliders", "config"));
        if (configSnap.exists() && configSnap.data().imgSlider?.igId) {
          const cfg = configSnap.data().imgSlider;
          // Charger le doc Firebase du jeu pour prix et steam_id
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
              id:          cfg.igId,
              name:        cfg.name,
              img:         cfg.img,
              price:       ed.price  || "0.00",
              retail:      ed.retail || "0.00",
              steam_id:    gData.steamData?.steam_appid || cfg.steam_id || 0,
              releaseDate,
              customCover: cfg.customCover || null,
            });
          } catch {
            setGameData({ id: cfg.igId, name: cfg.name, img: cfg.img,
              price: "0.00", retail: "0.00", steam_id: cfg.steam_id || 0 });
          }
          return;
        }

        // 2. Fallback : premier jeu trending sorti
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
        if (games[0]) setGameData(games[0]);
      } catch (e) { console.error("ImgSlider fetch error:", e); }
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

    const releaseDate = gameData.releaseDate || null;
    const releaseObj  = parseRelease(releaseDate);
    const today       = new Date(); today.setHours(0,0,0,0);
    const isPreco     = releaseObj ? releaseObj > today : false;

    setGameInfo({
      id:          gameData.id,
      title:       gameData.name,
      price:       `${parseFloat(gameData.price || 0).toFixed(2)} €`,
      promo:       gameData.retail && gameData.price && parseFloat(gameData.retail) > parseFloat(gameData.price)
                     ? `-${Math.round(((parseFloat(gameData.retail) - parseFloat(gameData.price)) / parseFloat(gameData.retail)) * 100)}%`
                     : "",
      isPreco,
      releaseDate,
      buy:         gameData.url,
    });

    const resolveHero = async () => {
      // Cover choisie dans l'admin (priorité absolue)
      if (gameData.customCover) { setHeroUrl(gameData.customCover); return; }

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

  const PriceBlock = ({ mobile }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 8 : 12 }}>
      {gameInfo.isPreco ? (
        <>
          {/* Badge PRÉCO + date sur une ligne */}
          <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "#dd163b",
              color: "#fff",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: mobile ? "9px" : "10px",
              letterSpacing: "1.5px",
              padding: mobile ? "5px 9px" : "6px 12px",
              borderRadius: "3px",
              textTransform: "uppercase",
              flexShrink: 0,
            }}>
              PRÉCO
            </span>
            {gameInfo.releaseDate && (
              <span style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 600,
                fontSize: mobile ? "13px" : "16px",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.5px",
              }}>
                {gameInfo.releaseDate}
              </span>
            )}
          </div>
          {/* Prix */}
          <div style={{ display: "flex", alignItems: "baseline", gap: mobile ? 6 : 10 }}>
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: mobile ? "clamp(28px, 7vw, 38px)" : "clamp(38px, 4.5vw, 58px)",
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-1px",
            }}>
              {gameInfo.price}
            </span>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              fontSize: mobile ? "11px" : "13px",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "1px",
              textTransform: "uppercase",
              paddingBottom: 4,
            }}>
             
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
              fontSize: mobile ? "9px" : "10px",
              letterSpacing: "1.5px",
              padding: mobile ? "5px 9px" : "6px 12px",
              borderRadius: "3px",
              width: "fit-content",
            }}>
              {gameInfo.promo}
            </span>
          )}
          <span style={{
            fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
            fontSize: mobile ? "clamp(28px, 7vw, 38px)" : "clamp(38px, 4.5vw, 58px)",
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
          <div style={{ position: "relative", zIndex: 1, padding: "0 16px", maxWidth: "72%" }}>
            <span style={{
              display: "block", fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
              fontSize: "clamp(13px, 3.8vw, 18px)", color: "#ffffff",
              lineHeight: 1.3, marginBottom: "8px",
            }}>
              {gameInfo.title}
            </span>
            <PriceBlock mobile={true} />
          </div>
        ) : (
          <div style={{ position: "relative", zIndex: 1, padding: "0 100px", maxWidth: "700px" }}>
            <span style={{
              display: "block", fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
              fontSize: "clamp(18px, 2.5vw, 32px)", color: "#ffffff",
              lineHeight: 1.3, marginBottom: "14px",
            }}>
              {gameInfo.title}
            </span>
            <PriceBlock mobile={false} />
          </div>
        )}
      </div>
    </Link>
  );
}

export default ImgSlider;