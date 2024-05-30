import React, { useState, useRef, useEffect } from "react";
import gameData from "./../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import HoverVideoPlayer from "react-hover-video-player";
function VideoHover() {
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
             {item ? (
          <div class="nk-gallery-item-box">
                      <a
                        href="assets/images/product-6.jpg"
                        class="nk-gallery-item"
                        data-size="1200x554"
                      >
                       
                        <HoverVideoPlayer
                          className="tot"
                          videoSrc={item.videoHover}
                          style={{
                            // Make the image expand to cover the video's dimensions
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          pausedOverlay={
                            <img src={item.imageUrl} alt={item.title} />
                          }
                        />
                      </a>
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

export default VideoHover