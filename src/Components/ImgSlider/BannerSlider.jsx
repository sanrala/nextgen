import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PROXY = "https://api.sm-artweb.fr";

function BannerSlider({ gameData }) {
  const [heroUrl, setHeroUrl] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);

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
        if (ok) {
          setHeroUrl(steamHero);
        } else {
          setHeroUrl(gameData.img);
        }
      } catch {
        setHeroUrl(gameData.img);
      }
    })();
  }, [gameData]);

  if (!gameInfo || !heroUrl) return null;

  return (
    <div style={{
      backgroundImage: `url(${heroUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center center",
      height: "280px",
      position: "relative",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      width: "100%",
    }}>
      {/* Dégradé gauche */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(0,0,0,0.92) 25%, rgba(0,0,0,0.3) 65%, transparent 100%)",
      }} />
      {/* Dégradé bas */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(23,30,34,1) 0%, transparent 50%)",
      }} />

      {/* Contenu */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "0 60px", maxWidth: "600px",
      }}>
        {/* Badge promo */}
        {gameInfo.promo && (
          <div style={{
            display: "inline-block",
            background: "#dd163b", color: "#fff",
            fontWeight: 700, fontSize: 13,
            padding: "3px 10px", borderRadius: 4,
            marginBottom: 10, letterSpacing: 1,
          }}>
            {gameInfo.promo}
          </div>
        )}

        <Link to={`/store/${gameInfo.id}/0/${gameInfo.slug}`} style={{ textDecoration: "none" }}>
          <h2 style={{
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: 800, fontSize: "clamp(18px, 3vw, 28px)",
            color: "#fff", margin: "0 0 8px",
            textTransform: "uppercase", lineHeight: 1.2,
          }}>
            {gameInfo.title}
          </h2>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <span style={{ color: "#fff", fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 700 }}>
            {gameInfo.price}
          </span>
        </div>

        <a href={gameInfo.buy} target="_blank" rel="noreferrer"
          className="nk-btn nk-btn-rounded nk-btn-color-main-1"
          style={{ fontSize: 13, padding: "8px 24px" }}>
          🛒 Acheter
        </a>
      </div>
    </div>
  );
}

export default BannerSlider;
