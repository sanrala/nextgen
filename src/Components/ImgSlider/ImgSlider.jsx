import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PROXY = "https://api.sm-artweb.fr";

function ImgSlider({ gameData }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [heroUrl, setHeroUrl] = useState(null);
  const [portraitUrl, setPortraitUrl] = useState(null);
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

    // On tente directement les URLs Steam — le <img> caché gèrera le fallback
    setHeroUrl(
      `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/library_hero.jpg`
    );
    setPortraitUrl(
      `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/portrait.png`
    );
  }, [gameData]);

  // Quand le hero échoue : storesearch via proxy pour trouver le jeu de base
  const handleHeroError = async () => {
    console.log("❌ Hero échoué, storesearch via proxy...");
    try {
      const searchTerm = gameData.name.split(':')[0].trim();
      const res = await fetch(
        `${PROXY}/api/steam-search?term=${encodeURIComponent(searchTerm)}`
      );
      const json = await res.json();
      const baseGame = json?.items?.find(
        (item) =>
          item.type === "app" &&
          item.price &&
          item.id !== gameData.steam_id
      );
      if (baseGame) {
        console.log("🔍 baseGame:", baseGame.name, baseGame.id);
        setHeroUrl(
          `https://cdn.akamai.steamstatic.com/steam/apps/${baseGame.id}/library_hero.jpg`
        );
        setPortraitUrl(
          `https://cdn.akamai.steamstatic.com/steam/apps/${baseGame.id}/portrait.png`
        );
      } else {
        setHeroUrl(gameData.img);
      }
    } catch {
      setHeroUrl(gameData.img);
    }
  };

  const handlePortraitError = () => {
    setPortraitUrl(gameData?.img || null);
  };

  // Deuxième échec hero (après storesearch) → image IG
  // const handleHeroError2 = () => {
  //   console.log("⚠️ Fallback image IG");
  //   setHeroUrl(gameData.img);
  // };

  if (!gameInfo || !heroUrl) return null;

  const currentImg = isMobile ? (portraitUrl || heroUrl) : heroUrl;

  return (
    <div
      style={{
        backgroundImage: `url(${currentImg})`,
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
      {/* Images cachées pour détecter les erreurs de chargement */}
      <img
        src={heroUrl}
        alt=""
        style={{ display: "none" }}
        onError={heroUrl === gameData?.img ? undefined : handleHeroError}
      />
      {portraitUrl && (
        <img
          src={portraitUrl}
          alt=""
          style={{ display: "none" }}
          onError={handlePortraitError}
        />
      )}

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
          background: "linear-gradient(to top, rgba(23,30,34,1) 0%, transparent 40%)",
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
            to={`/jeux/${gameInfo.id}`}
            style={{ textDecoration: "none", width: "100%", display: "block", textAlign: "center" }}
          >
            <h1
              className="title__price"
              style={{ fontSize: "32px", lineHeight: "1.2", textAlign: "center", width: "100%", margin: "0 0 10px" }}
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
        <div style={{ position: "relative", zIndex: 1, padding: "0 100px", maxWidth: "700px" }}>
          <Link to={`/jeux/${gameInfo.id}`} style={{ textDecoration: "none" }}>
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