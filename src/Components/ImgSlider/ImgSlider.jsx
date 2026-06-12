import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PROXY = "https://api.sm-artweb.fr";

function ImgSlider({ gameData }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [heroUrl, setHeroUrl] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);

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
      price: `${parseFloat(gameData.price).toFixed(2)}€`,
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
        // 1. library_hero depuis steam_id IG
        if (gameData.steam_id) {
          const heroUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/library_hero.jpg`;
          if (await checkImg(heroUrl)) { setHeroUrl(heroUrl); return; }
        }

        // 2. Cherche steamData en Firebase pour avoir le vrai steam_appid
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

            // Essai library_hero avec steamAppId Firebase
            if (appId && appId !== gameData.steam_id) {
              const heroFb = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`;
              if (await checkImg(heroFb)) { setHeroUrl(heroFb); return; }
            }

            // Essai premier screenshot Firebase
            const fbScreenshots = fbData?.steamData?.screenshots || [];
            if (fbScreenshots.length > 0) {
              setHeroUrl(fbScreenshots[0].path_full || fbScreenshots[0].path_thumbnail);
              return;
            }
          }
        } catch {}

        // 3. Fallback : premier screenshot via API Steam
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

        // 4. Dernier recours : header Steam (petit mais mieux que miniature IG)
        if (steamAppId) {
          const header = `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/header.jpg`;
          if (await checkImg(header)) { setHeroUrl(header); return; }
        }

        // 5. Rien trouvé : null (pas d'image affichée)
        setHeroUrl(null);

      } catch (e) {
        setHeroUrl(null);
      }
    };

    resolveHero();
  }, [gameData]);

  if (!gameInfo || !heroUrl) return null;

  return (
    <div
      style={{
        backgroundImage: `url(${heroUrl})`,
        backgroundSize: "cover",
        backgroundPosition: isMobile ? "center center" : "center top",
        height: "600px",
        position: "relative",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Dégradé principal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isMobile
            ? "linear-gradient(to top, rgba(0,0,0,0.95) 30%, transparent 70%)"
            : "linear-gradient(to right, rgba(0,0,0,0.9) 20%, transparent 60%)",
        }}
      />
      {/* Dégradé bas */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(23,30,34,1) 0%, transparent 40%)",
        }}
      />

      {isMobile ? (
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Link
            to={`/store/${gameInfo.id}/0/${gameInfo.title.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`}
            style={{
              textDecoration: "none",
              width: "100%",
              display: "block",
              textAlign: "center",
            }}
          >
            <h1
              className="title__price"
              style={{
                fontSize: "32px",
                lineHeight: "1.2",
                textAlign: "center",
                width: "100%",
                margin: "0 0 10px",
              }}
            >
              {gameInfo.title}
            </h1>
          </Link>
          <p className="text-white" style={{ margin: "0 0 20px", textAlign: "center" }}>
            <span className="priceSlidePromo">{gameInfo.promo}</span>{" "}
            <span className="price">{gameInfo.price}</span>
          </p>
          <a
            href={gameInfo.buy}
            className="nk-btn nk-btn-rounded nk-btn-color-white nk-btn-hover-color-main-1"
            target="_blank"
            rel="noreferrer"
          >
            Acheter
          </a>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "0 100px",
            maxWidth: "700px",
          }}
        >
          <Link to={`/store/${gameInfo.id}/0/${gameInfo.title.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`} style={{ textDecoration: "none" }}>
            <h1 className="title__price" style={{ whiteSpace: "nowrap" }}>
              {gameInfo.title}
            </h1>
          </Link>
          <p className="text-white" style={{ margin: "10px 0 20px" }}>
            <span className="priceSlidePromo">{gameInfo.promo}</span>{" "}
            <span className="price">{gameInfo.price}</span>
          </p>
          <a
            href={gameInfo.buy}
            className="nk-btn nk-btn-rounded nk-btn-color-white nk-btn-hover-color-main-1"
            target="_blank"
            rel="noreferrer"
          >
            Acheter
          </a>
        </div>
      )}
    </div>
  );
}

export default ImgSlider;