import React, { useState, useRef, useEffect } from "react";
import gameData from "./../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
function Descriptions() {
    const [item, setItem] = useState(null);

    const { id, title } = useParams();
    useEffect(() => {
      // Récupérer l'ID depuis l'URL
  
      // Recherchez l'élément correspondant dans le fichier JSON
      const selectedItem = gameData.find((item) => item.id === parseInt(id));
  
      // Mettre à jour l'état avec les données de l'élément sélectionné
      setItem(selectedItem);
    }, [id]);
    const [activeTab, setActiveTab] = useState("description");

    const handleTabChange = (tab) => {
      setActiveTab(tab);
    };
  
  return (
    <div>
          {item ? (
           <div
                  role="tabpanel"
                  className={
                    activeTab === "description"
                      ? "tab-pane fade show active"
                      : "tab-pane fade"
                  }
                  class="tab-pane fade show active"
                  id="tab-description"
                >
                  <div class="nk-gap"></div>

                  <div class="nk-gap"></div>
                  {!item.gifs ? null : (
                    <div className="text-left">
                      {item.gifs &&
                        item.gifs.map((gif, index) => (
                          <div key={index}>
                            <h3 className="h4">{gif.title}</h3>
                            <img className="img-fluid " src={gif.img} alt="" />
                            <div class="nk-gap-2"></div>
                            <p>{gif.texte}</p>
                          </div>
                        ))}
                    </div>
                  )}
                  {/* <p></p> */}
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

export default Descriptions