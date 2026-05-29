import React, { useState, useEffect } from "react";
import "./assets/css/style.css";
import Header from "./Components/Header/Header";
import ImgSlider from "./Components/ImgSlider/ImgSlider.jsx";
import LastPosts from "./Components/LastPosts/LastPosts.jsx";
import bg from "./assets/images/bg-fixed-1.jpg";
import Precommandes from "./Components/Precommandes/Precommandes";
import Popular from "./Components/Popular/Popular";
import Footer from "./Components/Footer/Footer";
import gameData from "./exclu.json";
import Box from "@mui/material/Box";
import Sorties from "./Components/Sorties/Sorties";
import CircularProgress from "@mui/material/CircularProgress";
import Banner from "./Components/Banner/Banner.jsx";

function Home() {
  const [randomImage, setRandomImage] = useState(null);
  const [bgImage, setBgImage] = useState(bg);
  const [isReady, setIsReady] = useState(false);
  const [topSeller, setTopSeller] = useState(null);

  useEffect(() => {
    const getRandomImage = () => {
      const randomNumber = Math.floor(Math.random() * gameData.length);
      setRandomImage(gameData[randomNumber]);
    };

    getRandomImage();

    const interval = setInterval(() => {
      getRandomImage();
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const parallaxFrame = document.querySelector(".parallax-frame");
      if (parallaxFrame) {
        const scrolled = window.pageYOffset;
        parallaxFrame.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.igBannerConfig = {
      lang: "fr",
      igr: "gamer-707207",
      banners: ["ig-banner-home"],
    };

    const script = document.createElement("script");
    script.src = "https://www.instant-gaming.com/api/banner/partner/loader.js";
    script.defer = true;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    const fetchBg = async () => {
      try {
        const res = await fetch("https://api.sm-artweb.fr/api/topsellers-recent");
        const data = await res.json();

        if (!data || data.length === 0) {
          setIsReady(true);
          return;
        }

        const game = data[0];
        setTopSeller(game); // 👈 partagé avec ImgSlider

        const img = new Image();
        img.src = game.img;
        img.onload = () => {
          setBgImage(game.img);
          setIsReady(true);
        };
        img.onerror = () => setIsReady(true);

      } catch (e) {
        console.error(e);
        setIsReady(true);
      }
    };

    fetchBg();
  }, []);

  return (
    <div>
      {randomImage && isReady ? (
        <div
          className="App"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        >
          <Header />
          <div className="nk-main">
            <div className="nk-gap-header"></div>

            <div className="container">
              <ImgSlider gameData={topSeller} /> {/* 👈 on passe les données */}
              <div className="separator product-panel"></div>
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
                      <i className="fa fa-quote-left" aria-hidden="true"></i>{" "}
                      Découvrez les offres sensationnelles de NextGen Gaming,
                      directement depuis Instant Gaming ! Des prix incroyables
                      vous attendent pour une expérience de jeu inégalée.
                      <i className="fa fa-quote-right" aria-hidden="true"></i>
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
              <div className="separator product-panel"></div>
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
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      )}
    </div>
  );
}

export default Home;