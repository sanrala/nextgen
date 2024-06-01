import React, { useState, useRef, useEffect } from "react";
import gameData from "./../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
function Actu() {
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        return date.toLocaleDateString("fr-FR", options);
      }
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
                <span class="text-main-1">L'actualité </span> du jeu
              </span>
            </h3>
            {item ? (
                <>
            {item.news &&
              item.news.map((v, index) => (
                <div class="nk-blog-post nk-blog-post-border-bottom" key={v.id}>
                  <div class="row vertical-gap">
                    <div class="col-lg-3 col-md-5">
                      <Link
                        key={v.news_id}
                        {...v}
                        to={{
                          pathname: `/news/${v.id}/${v.news_id}/`,
                        }}
                        class="nk-post-img"
                      >
                        <img src={v.imageUrl} alt={v.title} className="img-fluid" />

                        <span class="nk-post-categories">
                          {/* <span class="bg-main-1">{new.genre}</span> */}
                        </span>
                      </Link>
                    </div>
                    <div class="col-lg-9 col-md-7">
                      <h2 class="nk-post-title h4">
                        <Link
                          key={v.news_id}
                          {...v}
                          to={{
                            pathname: `/news/${v.id}/${v.news_id}/`,
                          }}
                        >
                          {v.title}
                        </Link>
                      </h2>
                      <div class="nk-post-date mt-10 mb-10">
                        <span class="fa fa-calendar"></span>{" "}
                        {formatDate(v.date)}
                        <span class="fa fa-comments"></span>{" "}
                        <a href="#">0 commentaires</a>
                      </div>
                      <div class="nk-post-text">
                        <p>{v.new.slice(0, 200) + "..."}</p>
                        <a class="nk-btn nk-btn-rounded nk-btn-color-dark-3 nk-btn-hover-color-main-1">
                          Détails
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
</>
      ) : (
        // Code à exécuter lorsque item est null
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      )}
    </div>
  )
}

export default Actu