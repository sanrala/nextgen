import React, { useState, useRef, useEffect } from "react";
import gameData from "./../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
function Screen() {
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
        <div class="row vertical-gap sm-gap">
                      {item.screen &&
                        item.screen.slice(1).map((screens, index) => (
                          <Gallery>
                            <Item
                              original={screens.img}
                              thumbnail={screens.img}
                              width="1920"
                              height="1024"
                            >
                              {({ ref, open }) => (
                                // <a class="nk-gallery-item" data-size="622x942">
                                <div class="col-6 col-md-3">
                                  <div class="nk-gallery-item-box">
                                    <img
                                      ref={ref}
                                      onClick={open}
                                      src={screens.img}
                                      className="img-fluid me-2 mb-2"
                                      alt={`Image ${index}`}
                                    />
                                  </div>
                                </div>
                                // </a>
                              )}
                            </Item>
                          </Gallery>
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

export default Screen