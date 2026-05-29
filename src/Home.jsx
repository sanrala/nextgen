import React, { useState, useEffect } from "react";
import "./assets/css/style.css";
import Header from "./Components/Header/Header";
import ImgSlider from "./Components/ImgSlider/ImgSlider.jsx";
import LastPosts from "./Components/LastPosts/LastPosts.jsx";
import bg from "./assets/images/bg-fixed-1.jpg";
import Precommandes from "./Components/Precommandes/Precommandes";
import Popular from "./Components/Popular/Popular";
import Footer from "./Components/Footer/Footer";
import Box from "@mui/material/Box";
import Sorties from "./Components/Sorties/Sorties";
import CircularProgress from "@mui/material/CircularProgress";
import Banner from "./Components/Banner/Banner.jsx";

function Home() {
  const [bgGame, setBgGame] = useState(null);

  useEffect(() => {
    const fetchTopGame = async () => {
      try {
        const res = await fetch(
          "https://api.sm-artweb.fr/api/topsellers-recent"
        );
        const data = await res.json();

        if (!data || data.length === 0) return;

        const game = data[0];

        let steamImg = null;

        // 🔥 IMAGE STEAM HD
        if (game.steam_id) {
          const steamId = game.steam_id;
          steamImg = `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_hero.jpg`;
        }

        setBgGame({
          ...game,
          finalImg: steamImg || game.img, // fallback IG
        });

      } catch (err) {
        console.error("Erreur récupération top game :", err);
      }
    };

    fetchTopGame();
  }, []);

  useEffect(() => {
    window.igBannerConfig = {
      lang: "fr",
      igr: "gamer-707207",
      banners: ["ig-banner-home"],
    };

    const script = document.createElement("script");
    script.src =
      "https://www.instant-gaming.com/api/banner/partner/loader.js";
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      {bgGame ? (
        <div
          className="App"
          style={{
            backgroundImage: `url(${bgGame.finalImg})`,
            backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
backgroundPosition: "top center",
backgroundColor: "#000", // optionnel (évite le blanc autour)
          }}
        >
          <Header />

          <div className="nk-main">
            <div className="nk-gap-header"></div>

            <div className="container">
              <ImgSlider />
              <div className="separator product-panel"></div>

              <Sorties />
              <div className="separator product-panel"></div>
            </div>

            <section
              className="banner-img"
              style={{ backgroundImage: `url(${bg})` }}
            >
              <div className="container d-flex justify-content-center">
                <div className="row">
                  <div className="col-xs-12">
                    <h3>
                      <i className="fa fa-quote-left"></i> Découvrez les offres
                      sensationnelles de NextGen Gaming, directement depuis
                      Instant Gaming ! Des prix incroyables vous attendent pour
                      une expérience de jeu inégalée.
                      <i className="fa fa-quote-right"></i>
                    </h3>
                  </div>
                </div>
              </div>
              <div className="parallax-holder">
                <div className="parallax-frame" />
              </div>
            </section>

            <div className="separator product-panel"></div>

            <div className="container">
              <Popular />
              <div className="separator product-panel"></div>
            </div>

            <Banner />

            <div className="separator product-panel"></div>

            <div className="container">
              <Precommandes />
              <div className="separator product-panel"></div>
              <LastPosts />
              <div className="separator product-panel"></div>
            </div>
          </div>

          <div className="separator product-panel"></div>
          <Footer />
        </div>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
          <CircularProgress />
        </Box>
      )}
    </div>
  );
}

export default Home;