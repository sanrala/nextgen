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
import Sorties from "./Components/Sorties/Sorties";
import Banner from "./Components/Banner/Banner.jsx";
import BoxNews from "./Components/BoxNews/BoxNews.jsx";
// import FeaturedGames from "./Components/FeaturedGames/FeaturedGames";
import BannerSlider from "./Components/ImgSlider/BannerSlider";
import FeaturedGamesPlayStation from "./Components/FeaturedGames/FeaturedGamesPlayStation";
import FeaturedGamesNintendo from "./Components/FeaturedGames/FeaturedGamesNintendo";
import FeaturedGamesXbox from "./Components/FeaturedGames/FeaturedGamesXbox";
import FeaturedGamesPC from "./Components/FeaturedGames/FeaturedGamesPC";
import RecentReleasesPlayStation from "./Components/FeaturedGames/RecentReleasesPlayStation";
import RecentReleasesNintendo from "./Components/FeaturedGames/RecentReleasesNintendo";
import RecentReleasesXbox from "./Components/FeaturedGames/RecentReleasesXbox";

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
      {/* Scan lines overlay */}
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

        .ng-track { fill: none; stroke: #1e1e1e; stroke-width: 3; }
        .ng-arc   { fill: none; stroke-linecap: round; }

        .ng-arc1 {
          stroke: #cc1a1a; stroke-width: 5;
          stroke-dasharray: 310; stroke-dashoffset: 310;
          animation: ngDraw 2.8s cubic-bezier(.4,0,.2,1) forwards .3s;
          filter: drop-shadow(0 0 6px #cc1a1a99);
        }
        .ng-arc2 {
          stroke: #a81515; stroke-width: 3;
          stroke-dasharray: 240; stroke-dashoffset: 240;
          animation: ngDraw 2.5s cubic-bezier(.4,0,.2,1) forwards 1.2s;
        }
        .ng-arc3 {
          stroke: #8a0f0f; stroke-width: 2;
          stroke-dasharray: 180; stroke-dashoffset: 180;
          animation: ngDraw 2.2s cubic-bezier(.4,0,.2,1) forwards 2.0s;
        }
        .ng-arc4 {
          stroke: #6b0a0a; stroke-width: 1.5;
          stroke-dasharray: 130; stroke-dashoffset: 130;
          animation: ngDraw 2.0s cubic-bezier(.4,0,.2,1) forwards 2.6s;
        }

        .ng-dot {
          fill: #cc1a1a; opacity: 0;
          animation: ngPop .8s ease forwards 3.2s;
          filter: drop-shadow(0 0 5px #cc1a1a);
        }
        .ng-dot2 { animation-delay: 3.5s !important; }

        @keyframes ngDraw { to { stroke-dashoffset: 0; } }
        @keyframes ngPop {
          0%   { opacity: 0; r: 0; }
          70%  { r: 5; }
          100% { opacity: 1; r: 3.5; }
        }

        .ng-ltr {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 64px;
          fill: #fff;
          opacity: 0;
          filter: drop-shadow(0 0 12px rgba(255,255,255,.25));
        }
        .ng-n1 { animation: ngSlide 1.2s cubic-bezier(.2,.8,.3,1) forwards 4.0s; }
        .ng-e1 { animation: ngSlide 1.2s cubic-bezier(.2,.8,.3,1) forwards 4.4s; }
        .ng-x  { animation: ngSlide 1.2s cubic-bezier(.2,.8,.3,1) forwards 4.8s; }
        .ng-t  { animation: ngSlide 1.2s cubic-bezier(.2,.8,.3,1) forwards 5.2s; }
        .ng-g  { animation: ngSlide 1.2s cubic-bezier(.2,.8,.3,1) forwards 5.6s; }
        .ng-e2 { animation: ngSlide 1.2s cubic-bezier(.2,.8,.3,1) forwards 6.0s; }
        .ng-n2 { animation: ngSlide 1.2s cubic-bezier(.2,.8,.3,1) forwards 6.4s; }

        @keyframes ngSlide {
          0%   { opacity: 0; transform: translateX(-35px) scaleX(.5); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translateX(0) scaleX(1); }
        }

        .ng-arrow-line {
          stroke: #cc1a1a; stroke-width: 2; fill: none; stroke-linecap: round;
          stroke-dasharray: 600; stroke-dashoffset: 600;
          animation: ngLine 2.5s ease forwards 7.8s;
          filter: drop-shadow(0 0 4px #cc1a1aaa);
        }
        .ng-adot-l {
          fill: #cc1a1a; opacity: 0;
          animation: ngPop .8s ease forwards 7.6s;
          filter: drop-shadow(0 0 4px #cc1a1a);
        }
        .ng-adot-r {
          fill: #cc1a1a; opacity: 0;
          animation: ngPop .8s ease forwards 10.3s;
          filter: drop-shadow(0 0 4px #cc1a1a);
        }
        @keyframes ngLine { to { stroke-dashoffset: 0; } }

        .ng-gaming {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 12px;
          fill: #cc1a1a;
          opacity: 0;
          filter: drop-shadow(0 0 8px rgba(204,26,26,.5));
          animation: ngFadeUp 1.2s ease forwards 10.5s;
        }
        @keyframes ngFadeUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <svg
        viewBox="0 0 500 250"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: 500, height: 250, position: "relative", zIndex: 10 }}
      >
        {/* Radar arcs */}
        <g transform="translate(150,0) scale(-1,1)">
          <g transform="rotate(-225 75 105)">
            <circle className="ng-track" cx="75" cy="105" r="72" />
            <circle className="ng-track" cx="75" cy="105" r="58" />
            <circle className="ng-track" cx="75" cy="105" r="44" />
            <circle className="ng-track" cx="75" cy="105" r="30" />
            <circle className="ng-arc ng-arc1" cx="75" cy="105" r="72" transform="rotate(100 75 105)" />
            <circle className="ng-arc ng-arc2" cx="75" cy="105" r="58" transform="rotate(-40 75 105)" />
            <circle className="ng-arc ng-arc3" cx="75" cy="105" r="44" transform="rotate(60 75 105)" />
            <circle className="ng-arc ng-arc4" cx="75" cy="105" r="30" transform="rotate(-120 75 105)" />
            <circle className="ng-dot" cx="75" cy="33" r="3.5" />
            <circle className="ng-dot ng-dot2" cx="3" cy="105" r="3" />
          </g>
        </g>

        {/* Letters NEXTGEN */}
        <text className="ng-ltr ng-n1" x="53" y="141">N</text>
        <text className="ng-ltr ng-e1" x="101" y="141">Ξ</text>
        <text className="ng-ltr ng-x" x="145" y="141">X</text>
        <text className="ng-ltr ng-t" x="193" y="141">T</text>
        <text className="ng-ltr ng-g" x="238" y="141">G</text>
        <text className="ng-ltr ng-e2" x="286" y="141">E</text>
        <text className="ng-ltr ng-n2" x="332" y="141">N</text>

        {/* Arrow */}
        <circle className="ng-adot-l" cx="145" cy="150" r="3.5" />
        <polyline className="ng-arrow-line" points="145,150 145,160 378,160 378,150" />
        <circle className="ng-adot-r" cx="378" cy="150" r="3.5" />

        {/* GAMING label */}
        <text className="ng-gaming" x="193" y="182" textLength="141" lengthAdjust="spacingAndGlyphs">
          GAMING
        </text>
      </svg>
    </div>
  );
}

function Home() {
  const [randomImage, setRandomImage] = useState(null);
  // const [bgImage, setBgImage] = useState(bg);
  const [isReady, setIsReady] = useState(false);
  const [topSeller, setTopSeller] = useState(null);
  const [topSeller2, setTopSeller2] = useState(null);

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
        setTopSeller(game);
        if (data[1]) setTopSeller2(data[1]);

        const steamBg = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_id}/library_hero.jpg`;

        const img = new Image();
        img.src = steamBg;
        img.onload = () => {
          // setBgImage(steamBg);
          setIsReady(true);
        };
        img.onerror = () => {
          // setBgImage(game.img);
          setIsReady(true);
        };
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
            {/* <div className="nk-gap-header"></div> */}

            {/* 👇 ImgSlider HORS du container = pleine largeur */}
            <ImgSlider gameData={topSeller} />

            <div className="container">
              <div className="separator product-panel"></div>
              <BoxNews />          {/* ← ajoute ici */}
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


            



        

            <div className="container">
              <Precommandes />
              <div className="separator product-panel"></div>

              <FeaturedGamesPC />
              
              <div className="separator product-panel"></div>
            </div>

            <Banner />
             <div className="separator product-panel"></div>
            <div className="container">
              <FeaturedGamesPlayStation />
              <div className="separator product-panel"></div>
              <RecentReleasesPlayStation/>
               <div className="separator product-panel"></div>
              <FeaturedGamesNintendo />
                <div className="separator product-panel"></div>
              <RecentReleasesNintendo/>
                </div>
                 <div className="separator product-panel"></div>
              {topSeller2 && <BannerSlider gameData={topSeller2} />}
              <div className="separator product-panel"></div>
               <div className="container">
              <FeaturedGamesXbox />
                 <div className="separator product-panel"></div>
              <RecentReleasesXbox/>

              <div className="separator product-panel"></div>
              {/* <PlaystationPrecommandes /> */}   
              <div className="separator product-panel"></div>
              <LastPosts />
              <div className="separator product-panel"></div>
            </div>
          </div>
          <div className="separator product-panel"></div>
          <Footer />
        </div>
      ) : (
        <LogoLoader />
      )}
    </div>
  );
}

export default Home;