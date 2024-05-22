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
import BestGenre from './Components/BestGenre/BestGenre'
import Footer from "./Components/Footer/Footer";
import gameData from "./exclu.json";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CircularProgress from '@mui/material/CircularProgress';

function Home() {
  const [randomImage, setRandomImage] = useState(null);



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
  
  return (
    <div>
      {randomImage ? (
          <div className="App" style={{ backgroundImage: `url(${randomImage.imageUrl})`, backgroundRepeat: "no-repeat", backgroundSize: "contain"}} >
     
                
      <Header />
      <div class="nk-main">
        <div class="nk-gap-header"></div>

        <div class="container">
          <ImgSlider />
          {/* <StartCatego /> */}
          <div class="nk-gap-2"></div>
          <h3 class="nk-decorated-h-2">
            <span>
              <span class="text-main-1">Actualités</span> du jour
            </span>
          </h3>
          <div class="nk-gap"></div>
          <BoxNews />
          <Popular/>
          <div class="nk-gap-2"></div>
          </div>
      
          <section class="banner-img" style={{ backgroundImage: `url(${bg})` }}>
        <div class="container d-flex justify-content-center">
          <div class="row">
            <div class="col-xs-12">
      
        

              <h3 ><i class="fa fa-quote-left" aria-hidden="true"></i> Découvrez les offres sensationnelles de NextGen, directement depuis Instant Gaming ! Des prix incroyables vous attendent pour une expérience de jeu inégalée.<i class="fa fa-quote-right" aria-hidden="true"></i></h3>
          
            </div>
          </div>
        </div>
        <div class="parallax-holder">
          <div
            class="parallax-frame"
           
          />
        </div>
      </section>
      <div class="nk-gap-2"></div>
       
      <div class="container">
        
          <Precommandes/>
          <LastPosts />
          {/* <BestGenre/> */}
        
          <div class="separator product-panel"></div>
        </div>

        {/* <!-- START: Page Background --> */}

        {/* <img class="nk-page-background-top" src={bg} alt="" />
        <img
          class="nk-page-background-bottom"
          src="assets/images/bg-bottom.png"
          alt=""
        /> */}

        {/* <!-- END: Page Background --> */}
      </div>
      <Footer/>
    </div>
            ) : (
              // Code à exécuter lorsque item est null
              <Box sx={{ display: 'flex' }}>
              <CircularProgress />
            </Box>
            )}
    </div>
  )
}

export default Home