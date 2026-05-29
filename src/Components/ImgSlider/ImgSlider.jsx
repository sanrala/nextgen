import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ImgSlider({ gameData }) {
  const [randomImage, setRandomImage] = useState(null);

  useEffect(() => {
    if (!gameData) return;

    const steamHero = `https://cdn.akamai.steamstatic.com/steam/apps/${gameData.steam_id}/library_hero.jpg`;

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

  if (!randomImage) return null;

  return (
    <div
      style={{
        backgroundImage: `url(${randomImage.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        height: "600px",
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Dégradé gauche */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.9) 20%, transparent 60%)",
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

      {/* Contenu */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "40px 60px",
          maxWidth: "500px",
        }}
      >
        <Link
          to={`/jeux/${randomImage.id}`}
          style={{ textDecoration: "none" }}
        >
          <h1 className="title__price">{randomImage.title}</h1>
        </Link>

        <p className="text-white" style={{ margin: "10px 0 20px" }}>
          <span className="priceSlidePromo">{randomImage.promo}</span>{" "}
          <span className="price">{randomImage.price}</span>
        </p>

        
      <a href={randomImage.buy}
          className="nk-btn nk-btn-rounded nk-btn-color-white nk-btn-hover-color-main-1"
          target="_blank"
          rel="noreferrer"
        >
          Instant Gaming
        </a>
      </div>
    </div>
  );
}

export default ImgSlider;