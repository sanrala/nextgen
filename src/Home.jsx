import React, { useState, useEffect } from "react";
import "./assets/css/style.css";
import Header from "./Components/Header/Header";
import ImgSlider from "./Components/ImgSlider/ImgSlider";
import StartCatego from "./Components/StartCatego/StartCatego";
import BoxNews from "./Components/BoxNews/BoxNews";
import LastPosts from "./Components/LastPosts/LastPosts";
import bg from "./assets/images/bg-fixed-1.jpg";
import Precommandes from "./Components/Precommandes/Precommandes";
import Popular from "./Components/Popular/Popular";
import BestGenre from "./Components/BestGenre/BestGenre";
import Footer from "./Components/Footer/Footer";
import gameData from "./exclu.json";
import gameDatas from "./exclus.json";
import game from "./games.json";
import { Link , useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import Sorties from "./Components/Sorties/Sorties";
import TwitchEmbedVideo from "react-twitch-embed-video";
import CircularProgress from "@mui/material/CircularProgress";
import { Parallax } from "react-parallax";
import { EmbedEverything } from 'twitch-embed'; // Importer EmbedEverything depuis la bibliothèque twitch-embed

function Home() {
  const [randomImage, setRandomImage] = useState(null);
  const [randomImages, setRandomImages] = useState(null);

  useEffect(() => {
    // Définir une fonction pour récupérer une image aléatoire
    const getRandomImage = () => {
      const randomNumber = Math.floor(Math.random() * gameData.length);
      const randomImageData = gameData[randomNumber];
      setRandomImage(randomImageData);
    };

    // Appeler la fonction pour obtenir une image aléatoire au chargement initial
    getRandomImage();

    // Mettre à jour l'image toutes les 2 heures
    const interval = setInterval(() => {
      getRandomImage();
    }, 2 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Définir une fonction pour récupérer une image aléatoire
    const getRandomImages = () => {
      const randomNumber = Math.floor(Math.random() * gameDatas.length);
      const randomImageData = gameDatas[randomNumber];
      setRandomImages(randomImageData);
    };

    // Appeler la fonction pour obtenir une image aléatoire au chargement initial
    getRandomImages();

    // Mettre à jour l'image toutes les 2 heures
    const interval = setInterval(() => {
      getRandomImages();
    }, 2 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [liveChannel, setLiveChannel] = useState(false);
  const [videos, setVideos] = useState([]);
  console.log(videos);
  useEffect(() => {
    const fetchVideos = async () => {
      // Code pour récupérer les vidéos enregistrées
    };

    const checkLiveStatus = async () => {
      // Code pour vérifier si la chaîne est en direct
    };

    checkLiveStatus(); // Vérifier le statut en direct au chargement initial
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      const parallaxFrame = document.querySelector('.parallax-frame');
      if (parallaxFrame) {
        const scrolled = window.pageYOffset;
        parallaxFrame.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <div>
      {randomImage ? (
        
        <div
          className="App"
          style={{
            backgroundImage: `url(${randomImage.imageUrl})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        >
          <Header />
          <div class="nk-main">
            <div class="nk-gap-header"></div>

            <div class="container">
              <ImgSlider />
              {/* <StartCatego /> */}
              <div class="separator product-panel"></div>

              <BoxNews />
              <div class="separator product-panel"></div>

              <Sorties />
              <div class="separator product-panel"></div>
              </div>

           
<section
      class="banner-img"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div class="container d-flex justify-content-center">
        <div class="row">
          <div class="col-xs-12">
            <h3>
              <i class="fa fa-quote-left" aria-hidden="true"></i>{" "}
              Découvrez les offres sensationnelles de NextGen Gaming,
              directement depuis Instant Gaming ! Des prix incroyables
              vous attendent pour une expérience de jeu inégalée.
              <i class="fa fa-quote-right" aria-hidden="true"></i>
            </h3>
          </div>
        </div>
      </div>
      <div class="parallax-holder">
        <div class="parallax-frame" />
      </div>
    </section>
    <div class="separator product-panel"></div>
    {/* <div class="container">
              <h3 class="nk-decorated-h-2">
          <span>
            <span class="text-main-1">TWITCH</span>
          </span>
        </h3>

            <div className="cover-container">
              <TwitchEmbedVideo
                channel="tonton"
                allowfullscreen={true} // Ajouter l'attribut allowfullscreen
                controls={false} // Désactiver les contrôles de jeu mature
                withChat="false"
                apiKey="wrr5jchxkl0nvgbnx14nvt7mt4wbx5"
                width="100%"
                height="100%"
              />
     <iframe
                src="https://player.twitch.tv/?channel=Cryptelo_&parent=yourwebsite.com&autoplay=false"
                height="100%"
                width="100%"
                frameBorder="0"
                scrolling="no"
                allowFullScreen="true"
              ></iframe>
            </div>
            <div class="separator product-panel"></div>
         
              <Popular />
              <div class="separator product-panel"></div>
            </div> */}
        
            <section
      className="banner-img"
      style={{ backgroundImage: `url(${randomImages.imageUrl})` }}
    >
      <div className="container">
        <div className="nk-image-slider-content">
          <h3 className="title__price">
            {randomImages.title}
          </h3>
          <p className="text-white">
            <span className="priceSlidePromo">
              {randomImages.promo}
            </span>{" "}
            <span className="price">{randomImages.price}</span>
          </p>
        </div>
      </div>
      <div className="parallax-holder">
        <div className="parallax-frame" />
      </div>
    </section>
          
            <div class="separator product-panel"></div>

            <div class="container">
              <Precommandes />
              <div class="separator product-panel"></div>
              <LastPosts />
              {/* <BestGenre/> */}

              <div class="separator product-panel"></div>
            </div>
          </div>
          <div class="separator product-panel"></div>
          <Footer />
        </div>
      ) : (
        // Code à exécuter lorsque item est null
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      )}
    </div>
  );
}

export default Home;
