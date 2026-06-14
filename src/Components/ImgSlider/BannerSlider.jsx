import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const PROXY = "https://api.sm-artweb.fr";

function BannerSlider({ gameData }) {
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