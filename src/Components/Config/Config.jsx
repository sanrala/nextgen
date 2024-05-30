import React, { useState, useRef, useEffect } from "react";
import gameData from "./../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
function Config() {
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
                <span class="text-main-1">Configurations</span>
              </span>
            </h3>
            <div class="nk-gap"></div>
            {item ? (
            <div class="specs-container listing-slider">
              {item.config &&
                item.config.map((v, index) => (
                  <>
                    <div class="minimal" key={index}>
                      <h3>
                        minimale<span class="asterix">*</span>
                      </h3>{" "}
                      <div class="specs">
                        <li>
                          <strong>OS:</strong> {v.OSmin}
                        </li>
                        <li>
                          <strong>Processor:</strong> {v.PROCmin}
                        </li>
                        <li>
                          <strong>Memory:</strong> {v.MEMmin}
                        </li>
                        <li>
                          <strong>Graphics:</strong> {v.GRAPHmin}
                        </li>
                        <li>
                          <strong>Storage:</strong> {v.HDD}
                        </li>
                      </div>
                    </div>
                    <div class="recommended">
                      <h3>
                        recommandée<span class="asterix">*</span>
                      </h3>{" "}
                      <div class="specs">
                        <li>
                          <strong>OS:</strong> {v.OSmax}
                        </li>
                        <li>
                          <strong>Processor:</strong> {v.PROCmax}
                        </li>
                        <li>
                          <strong>Memory:</strong> {v.MEMmax}
                        </li>
                        <li>
                          <strong>Graphics:</strong>
                          {v.GRAPHmax}
                        </li>
                        <li>
                          <strong>Storage:</strong> {v.HDD}
                        </li>
                      </div>
                    </div>
                  </>
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

export default Config