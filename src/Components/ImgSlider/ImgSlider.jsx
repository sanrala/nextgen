import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ImgSlider({ gameData }) {
  const [randomImage, setRandomImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileImg, setMobileImg] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!gameData) return;

    const steamHero = `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/library_hero.jpg`;
    const steamPortrait = `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/portrait.png`;

    const img = new Image();
    img.src = steamPortrait;
    img.onload = () => setMobileImg(steamPortrait);
    img.onerror = () => setMobileImg(gameData.img);

    setRandomImage({
      id: gameData.id,
      title: gameData.name,
      imageUrl: steamHero,
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
  }, [gameData]);

  if (!randomImage || !mobileImg) return null;

  const currentImg = isMobile ? mobileImg : randomImage.imageUrl;

  return (
    <div
      style={{
        backgroundImage: `url(${currentImg})`,
        backgroundSize: "cover",
        backgroundPosition: isMobile ? "center center" : "center top",
        height: isMobile ? "600px" : "600px",
        position: "relative",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Dégradé principal */}
      <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to top, rgba(0,0,0,0.95) 30%, transparent 70%)" : "linear-gradient(to right, rgba(0,0,0,0.9) 20%, transparent 60%)" }} />
      {/* Dégradé bas */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(23,30,34,1) 0%, transparent 40%)" }} />

      {isMobile ? (
        /* ── VERSION MOBILE : position absolue centrée ── */
        <div style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <Link to={`/jeux/${randomImage.id}`} style={{ textDecoration: "none", width: "100%", display: "block", textAlign: "center" }}>
            <h1 className="title__price" style={{ fontSize: "32px", lineHeight: "1.2", textAlign: "center", width: "100%", margin: "0 0 10px" }}>
              {randomImage.title}
            </h1>
          </Link>
          <p className="text-white" style={{ margin: "0 0 20px", textAlign: "center" }}>
            <span className="priceSlidePromo">{randomImage.promo}</span>{" "}
            <span className="price">{randomImage.price}</span>
          </p>
          <a href={randomImage.buy} className="nk-btn nk-btn-rounded nk-btn-color-white nk-btn-hover-color-main-1" target="_blank" rel="noreferrer">
            Acheter
          </a>
        </div>
      ) : (
        /* ── VERSION DESKTOP ── */
        <div style={{ position: "relative", zIndex: 1, padding: "0 100px", maxWidth: "700px" }}>
          <Link to={`/jeux/${randomImage.id}`} style={{ textDecoration: "none" }}>
            <h1 className="title__price" style={{ whiteSpace: "nowrap" }}>{randomImage.title}</h1>
          </Link>
          <p className="text-white" style={{ margin: "10px 0 20px" }}>
            <span className="priceSlidePromo">{randomImage.promo}</span>{" "}
            <span className="price">{randomImage.price}</span>
          </p>
          <a href={randomImage.buy} className="nk-btn nk-btn-rounded nk-btn-color-white nk-btn-hover-color-main-1" target="_blank" rel="noreferrer">
            Acheter
          </a>
        </div>
      )}
    </div>
  );
}

export default ImgSlider;