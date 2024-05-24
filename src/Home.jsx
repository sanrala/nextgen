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
import game from "./games.json";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";

import CircularProgress from '@mui/material/CircularProgress';

function Home() {
  const [randomImage, setRandomImage] = useState(null);

  const images = [
    {
        url: 'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mwiii/MWIII-REVEAL-FULL-TOUT.jpg',
        title: 'Titre 1',
        text: 'Description de l\'image 1',
    },
    {
        url: 'https://gaming-cdn.com/images/products/15506/616x353/grand-theft-auto-vi-ps5-playstation-5-jeu-playstation-store-cover.jpg?v=1702542535',
        title: 'Titre 2',
        text: 'Description de l\'image 2',
    },
    {
        url: 'https://gaming-cdn.com/images/products/5376/616x353/s-t-a-l-k-e-r-2-heart-of-chornobyl-pc-jeu-steam-europe-cover.jpg?v=1709717150',
        title: 'Titre 3',
        text: 'Description de l\'image 3',
    },
    {
      url: "https://gaming-cdn.com/images/products/16844/616x353/f1-manager-2024-deluxe-edition-deluxe-edition-pc-jeu-steam-europe-cover.jpg?v=1715939224",
      title: 'Titre 4',
      text: 'Description de l\'image 4',
    },
   { 
    url: "https://res.cloudinary.com/dzhhs7sfk/image/upload/v1716230927/hellblade-2-4k-wallpaper-3840x2160-18749_rhrlpg.png",
    title: 'Titre 5 ',
    text: 'Description de l\'image 5',
   },
   { 
    url: "https://www.presse-citron.net/app/uploads/2024/05/COD-UNREDACTED-TOUT-680x453.jpg",
    title: 'Titre 6 ',
    text: 'Description de l\'image 6',
   }
  
];

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




  const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % game.length);
        }, 3000); // Changer d'image toutes les 3 secondes

        return () => clearInterval(interval);
    }, []);

    const handleImageClick = (index) => {
        setCurrentImageIndex(index);
    };

  
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
          <div class="separator product-panel"></div>
        
          <BoxNews />
          <div class="separator product-panel"></div>
          <Popular/>
          <div class="separator product-panel"></div>
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
      <div class="separator product-panel"></div>
       
      <div class="container">
        
          <Precommandes/>
          <div class="separator product-panel"></div>
          <LastPosts />
          {/* <BestGenre/> */}
        
          <div class="separator product-panel"></div>

          <div className="carousel">
            <div className="main-image" style={{ backgroundImage: `url(${game[currentImageIndex].imageUrl})` }}>
                <div className="image-overlay">
                    <h2>{game[currentImageIndex].title}</h2>
                    {/* <p>{game[currentImageIndex].resume}</p> */}
                </div>
            </div>
            <div className="thumbnail-background">
                <div className="thumbnail-container">
                    {game.map((image, index) => (
                        <div 
                            key={index} 
                            className={`thumbnail ${index === currentImageIndex ? 'selected' : ''}`}
                            onClick={() => handleImageClick(index)}
                            style={{ backgroundImage: `url(${image.imageUrl})` }}
                        />
                    ))}
                </div>
            </div>
        </div>

        </div>

      
    
      



      </div>
      <div class="separator product-panel"></div>
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