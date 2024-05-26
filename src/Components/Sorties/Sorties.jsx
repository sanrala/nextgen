import React, { useState, useEffect } from 'react'
import game from "./../../games.json";
import { Link } from "react-router-dom";
function Sorties() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
   // Obtenez la date actuelle
   const today = new Date();
  const sortedImages = game
  .filter(game => new Date(game.dateSortie) <= today) // Ne conserver que les images avec des dates passées ou aujourd'hui
  .sort((a, b) => new Date(b.dateSortie) - new Date(a.dateSortie)) // Trier par date de sortie
  .slice(0, 6); // Prendre les 6 premières images
  useEffect(() => {
      const interval = setInterval(() => {
          setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sortedImages.length);
      }, 10000); // Changer d'image toutes les 3 secondes

      return () => clearInterval(interval);
  }, [sortedImages.length]);

  const handleImageClick = (index) => {
      setCurrentImageIndex(index);
  };
  return (
    <div>
       <Link
                  to={{
                    pathname: `/Sorties/`,
                  }}
                >
            <h3 class="nk-decorated-h-2">
          <span>
            <span class="text-main-1">Les dernières</span> sorties
          </span>
        </h3>
        </Link>

      <div class="nk-gap"></div>
          <div className="carousel">

            <div className="main-image" style={{ backgroundImage: `url(${sortedImages[currentImageIndex].imageUrl})` }}>
          
            <div className="image-overlay">
            <Link
                      key={sortedImages[currentImageIndex].id}
                      {...sortedImages[currentImageIndex]}
                      to={{
                        pathname: `/PC/${sortedImages[currentImageIndex].id}/${sortedImages[currentImageIndex].title}`,
                        state: { itemData: sortedImages[currentImageIndex] }, // Passer les données de l'élément à la page BlocArticle
                      }}>
                    <h2>{sortedImages[currentImageIndex].title}</h2>
                    </Link>
                    <div className="price-tag">{sortedImages[currentImageIndex].price}</div>
              
                </div>
            </div>
            <div className="thumbnail-background">
                <div className="thumbnail-container">
                    {sortedImages.map((image, index) => (
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
  )
}

export default Sorties