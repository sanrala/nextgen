import React, { useState, useEffect } from "react";
import "./assets/css/style.css";
import Header from "./Components/Header/Header";
import ImgSlider from "./Components/ImgSlider/ImgSlider.jsx";
import LastPosts from "./Components/LastPosts/LastPosts.jsx";
// import bg from "./assets/images/bg-fixed-1.jpg";
import Precommandes from "./Components/Precommandes/Precommandes";
import Popular from "./Components/Popular/Popular";
import Footer from "./Components/Footer/Footer";
import gameData from "./exclu.json";
import VR from "./Components/Virtual/Virtual";
import Banner from "./Components/Banner/Banner.jsx";
import BoxNews from "./Components/BoxNews/BoxNews.jsx";
import BannerSlider from "./Components/ImgSlider/BannerSlider";
import FeaturedGamesPlayStation from "./Components/FeaturedGames/FeaturedGamesPlayStation";
import FeaturedGamesNintendo from "./Components/FeaturedGames/FeaturedGamesNintendo";
import FeaturedGamesXbox from "./Components/FeaturedGames/FeaturedGamesXbox";
import FeaturedGamesPC from "./Components/FeaturedGames/FeaturedGamesPC";
import RecentReleasesPlayStation from "./Components/FeaturedGames/RecentReleasesPlayStation";
import RecentReleasesNintendo from "./Components/FeaturedGames/RecentReleasesNintendo";
import RecentReleasesXbox from "./Components/FeaturedGames/RecentReleasesXbox";
import SteamSpecials from "./Components/SteamSpecials/SteamSpecials";
import RecentGuides from "./Components/Home/RecentGuides";


function LogoLoader() {
  return (
    <div
      style={{
        background: "#0d0d0d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
          opacity: 0.4,
          zIndex: 5,
        }}
      />
      <svg viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg" style={{ width: 500, height: 250 }}>
        <text x="50" y="140" fill="#fff">NEXTGEN</text>
      </svg>
    </div>
  );
}

function Home() {
  const [randomImage, setRandomImage] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [topSeller, setTopSeller] = useState(null);
  const [topSeller2, setTopSeller2] = useState(null);

  useEffect(() => {
    const getRandomImage = () => {
      const randomNumber = Math.floor(Math.random() * gameData.length);
      setRandomImage(gameData[randomNumber]);
    };
    getRandomImage();
    const interval = setInterval(getRandomImage, 2 * 60 * 60 * 1000);
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
    window.igBannerConfig = { lang: "fr", igr: "gamer-707207", banners: ["ig-banner-home"] };
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
        if (!data || data.length === 0) { setIsReady(true); return; }
        const game = data[0];
        setTopSeller(game);
        if (data[1]) setTopSeller2(data[1]);
        const steamBg = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/library_hero.jpg`;
        const img = new Image();
        img.src = steamBg;
        img.onload = () => setIsReady(true);
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
        <div className="App">
          <Header />
          <div className="nk-main">

            <ImgSlider gameData={topSeller} />

            <div className="container">
              <BoxNews />
              <div className="separator product-panel"></div>
              <Popular />
              <div className="separator product-panel"></div>
            </div>

            {/* <section className="banner-img" style={{ backgroundImage: `url(${bg})` }}>
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
            </section> */}
            
            <RecentGuides />

            <div className="container">
              <div className="separator product-panel"></div>
              <Precommandes />
            </div>

            <div className="container">
              <VR />
              <div className="separator product-panel"></div>
              <FeaturedGamesPC />
              <div className="separator product-panel"></div>
            </div>

            <Banner />
            <div className="separator product-panel"></div>

            <div className="container">
              <FeaturedGamesPlayStation />
              <RecentReleasesPlayStation />
              <FeaturedGamesNintendo />
              <RecentReleasesNintendo />
            </div>

            <div className="separator product-panel"></div>
            {topSeller2 && <BannerSlider gameData={topSeller2} />}
            <div className="separator product-panel"></div>

            <div className="container">
              <FeaturedGamesXbox />
              <div className="separator product-panel"></div>
              <RecentReleasesXbox />
              <div className="separator product-panel"></div>
            </div>

            <a href="/Catalogues?platform=CartesCadeaux" className="f-banner">
              <img src="/images/BannerCards.png" alt="Cartes cadeaux NextGen Gaming Instant Gaming" />
            </a>

            <div className="container">
              <div className="separator product-panel"></div>
              <SteamSpecials />
              <div className="separator product-panel"></div>
            </div>

            

            <div className="container">
              <div className="separator product-panel"></div>
              <LastPosts />
            </div>

          </div>

          <div className="separator product-panel"></div>

          <a href="https://www.instant-gaming.com/?igr=gamer-707207" target="_blank" rel="noopener noreferrer" className="f-banner">
            <img src="/images/banner-instant-gaming.png" alt="Promo Instant Gaming" />
          </a>
          <Footer />
        </div>
      ) : (
        <LogoLoader />
      )}
    </div>
  );
}

export default Home;