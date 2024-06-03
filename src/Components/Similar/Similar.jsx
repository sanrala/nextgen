import React, { useState, useRef, useEffect } from "react";
import gameData from "./../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
function Similar() {
  const [item, setItem] = useState(null);

  const { id, title } = useParams();
  useEffect(() => {
    // Récupérer l'ID depuis l'URL

    // Recherchez l'élément correspondant dans le fichier JSON
    const selectedItem = gameData.find((item) => item.id === parseInt(id));

    // Mettre à jour l'état avec les données de l'élément sélectionné
    setItem(selectedItem);
  }, [id]);
  return (
    <div>
     
           <h3 class="nk-decorated-h-2">
              <span>
                <span class="text-main-1">Jeux</span> Similaires
              </span>
            </h3>

            <div class="nk-gap"></div>
            {item ? (
              <div className="slider-container">
                {/* <Slider {...settings}> */}

                {gameData.map((i, id) => (
                  <div
                    className="nk-blog-poste"
                    key={id}
                    style={{
                      display: item.genre !== i.genre ? "none" : "block",
                    }}
                  >
                    {item.genre === i.genre ? (
                      <div
                        key={id}
                        // style={{ width: '40%' }}
                      >
   <Link
                          key={i.id}
                          {...i}
                          to={{
                            pathname: `/PC/${i.id}/${i.title}`,
                            state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          onClick={() => {
                            window.scrollTo(0, 0);
                          }}
                          class="nk-post-img"
                        >
                          <img src={i.imageUrl} alt={i.title} />
                          <span className="nk-post-comments-count">
                            {i.promo}
                          </span>
                        </Link>
                           {/* {i.plateformes &&
                    i.plateformes.map((v, index) => (
                      <>
                            {v.support === "Steam" && (
                        <Link
                          key={v.id}
                          {...v}
                          to={{
                            pathname: `/PC/${v.id}/${v.title}`,
                            state: { itemData: v }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          onClick={() => {
                            window.scrollTo(0, 0);
                          }}
                          class="nk-post-img"
                        >
                          <img src={i.imageUrl} alt={i.title} />
                          <span className="nk-post-comments-count">
                            {i.promo}
                          </span>
                        </Link>
                           )}
                           {v.support === "Ubisoft" && (
                        <Link
                          key={i.id}
                          {...i}
                          to={{
                            pathname: `/Ubisoft/${i.id}/${i.title}`,
                            state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          onClick={() => {
                            window.scrollTo(0, 0);
                          }}
                          class="nk-post-img"
                        >
                          <img src={i.imageUrl} alt={i.title} />
                          <span className="nk-post-comments-count">
                            {i.promo}
                          </span>
                        </Link>
                           )}
                             {v.support === "Playstation 5" && (
                        <Link
                          key={i.id}
                          {...i}
                          to={{
                            pathname: `/Playstation/${i.id}/${i.title}`,
                            state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          onClick={() => {
                            window.scrollTo(0, 0);
                          }}
                          class="nk-post-img"
                        >
                          <img src={i.imageUrl} alt={i.title} />
                          <span className="nk-post-comments-count">
                            {i.promo}
                          </span>
                        </Link>
                           )}
                                {v.support === "Xbox Series" && (
                        <Link
                          key={i.id}
                          {...i}
                          to={{
                            pathname: `/Xbox/${i.id}/${i.title}`,
                            state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          onClick={() => {
                            window.scrollTo(0, 0);
                          }}
                          class="nk-post-img"
                        >
                          <img src={i.imageUrl} alt={i.title} />
                          <span className="nk-post-comments-count">
                            {i.promo}
                          </span>
                        </Link>
                           )}
                               {v.support === "Rockstar" && (
                        <Link
                          key={i.id}
                          {...i}
                          to={{
                            pathname: `/PC_Rockstar/${i.id}/${i.title}`,
                            state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          onClick={() => {
                            window.scrollTo(0, 0);
                          }}
                          class="nk-post-img"
                        >
                          <img src={i.imageUrl} alt={i.title} />
                          <span className="nk-post-comments-count">
                            {i.promo}
                          </span>
                        </Link>
                           )}
                               {v.support === "Battle.net" && (
                        <Link
                          key={i.id}
                          {...i}
                          to={{
                            pathname: `/Battlenet/${i.id}/${i.title}`,
                            state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          onClick={() => {
                            window.scrollTo(0, 0);
                          }}
                          class="nk-post-img"
                        >
                          <img src={i.imageUrl} alt={i.title} />
                          <span className="nk-post-comments-count">
                            {i.promo}
                          </span>
                        </Link>
                           )}
                           </>
                             ))} */}
                        <div className="nk-gap"></div>
                        <h2 className="nk-post-title h4 d-flex justify-content-between">
                          <Link
                            key={i.id}
                            {...i}
                            to={{
                              pathname: `/PC/${i.id}/${i.title}`,
                              state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                            }}
                            class="nk-post-img"
                          >
                            {i.title}{" "}
                          </Link>
                          <span>{i.price}</span>
                        </h2>
                        
                    
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
 
) : (
  // Code à exécuter lorsque item est null
  <Box sx={{ display: "flex" }}>
    <CircularProgress />
  </Box>
)}
    </div>
  )
}

export default Similar