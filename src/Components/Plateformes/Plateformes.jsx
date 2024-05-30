import React, { useState, useRef, useEffect } from "react";
import gameData from "./../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import ReadMore from "./../ReadMore/ReadMore";
import Select from "@mui/material/Select";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
function Plateformes() {
    const [item, setItem] = useState(null);

    const { id, title } = useParams();
    useEffect(() => {
      // Récupérer l'ID depuis l'URL
  
      // Recherchez l'élément correspondant dans le fichier JSON
      const selectedItem = gameData.find((item) => item.id === parseInt(id));
  
      // Mettre à jour l'état avec les données de l'élément sélectionné
      setItem(selectedItem);
    }, [id]);

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

      const [comments, setComments] = useState([]);

      const calculateAverageRating = () => {
        const totalRating = comments.reduce(
          (acc, comment) => acc + parseInt(comment.rating),
          0
        );
        return totalRating / comments.length || 0;
      };
      const averageRating = calculateAverageRating();
      const getRatingColor = (rating) => {
        if (rating >= 4) return "green";
        if (rating >= 2) return "orange";
        if (rating > 0) return "red";
        return "gray";
      };
    
      function getRatingIcon(rating) {
        if (rating >= 0.1 && rating <= 1) {
          return <SentimentVeryDissatisfiedIcon color="error" />;
        } else if (rating > 1 && rating <= 2) {
          return <SentimentDissatisfiedIcon color="error" />;
        } else if (rating > 2 && rating <= 3) {
          return <SentimentSatisfiedIcon color="warning" />;
        } else if (rating > 3 && rating <= 4) {
          return <SentimentSatisfiedAltIcon color="success" />;
        } else if (rating > 4 && rating <= 5) {
          return <SentimentVerySatisfiedIcon color="success" />;
        } else {
          return null;
        }
      }
      function getRatingDescription(rating) {
        if (rating === null || rating === undefined) {
          return "Aucune note";
        }
    
        if (rating === 0) {
          return <span style={{ color: "red" }}>Aucune note</span>;
        } else if (rating >= 0.1 && rating <= 1) {
          return <span style={{ color: "red" }}>Négative</span>;
        } else if (rating >= 1.1 && rating <= 2.5) {
          return <span style={{ color: "orange" }}>Très moyen</span>;
        } else if (rating >= 2.6 && rating <= 3.5) {
          return <span style={{ color: "orange" }}>Moyen</span>;
        } else if (rating >= 3.6 && rating <= 4) {
          return <span style={{ color: "green" }}>Positives</span>;
        } else if (rating >= 4.1 && rating <= 4.7) {
          return <span style={{ color: "green" }}>Très positives</span>;
        } else if (rating >= 4.8 && rating <= 5) {
          return <span style={{ color: "#478eff" }}>Divin</span>;
        } else {
          return "Aucune note";
        }
      }
      const [age, setAge] = React.useState("");

      const handleChange = (event) => {
        setAge(event.target.value);
      };
  return (
    <div>

{item ? (
            <div class="col-md-6">
                  <div class="subinfos">
                    <a href="" class="platform steam">
                      <div class="single platform-steam">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="30"
                          width="27.5"
                          viewBox="0 0 448 512"
                        >
                          <path
                            fill="#fff"
                            d="M395.5 177.5c0 33.8-27.5 61-61 61-33.8 0-61-27.3-61-61s27.3-61 61-61c33.5 0 61 27.2 61 61zm52.5 .2c0 63-51 113.8-113.7 113.8L225 371.3c-4 43-40.5 76.8-84.5 76.8-40.5 0-74.7-28.8-83-67L0 358V250.7L97.2 290c15.1-9.2 32.2-13.3 52-11.5l71-101.7c.5-62.3 51.5-112.8 114-112.8C397 64 448 115 448 177.7zM203 363c0-34.7-27.8-62.5-62.5-62.5-4.5 0-9 .5-13.5 1.5l26 10.5c25.5 10.2 38 39 27.7 64.5-10.2 25.5-39.2 38-64.7 27.5-10.2-4-20.5-8.3-30.7-12.2 10.5 19.7 31.2 33.2 55.2 33.2 34.7 0 62.5-27.8 62.5-62.5zm207.5-185.3c0-42-34.3-76.2-76.2-76.2-42.3 0-76.5 34.2-76.5 76.2 0 42.2 34.3 76.2 76.5 76.2 41.9 .1 76.2-33.9 76.2-76.2z"
                          />
                        </svg>
                      </div>
                      Steam
                      <div class="spacer"></div>
                    </a>{" "}
                    <div class="preorder">
                      <h2 class="nk-productpro-title h3pro">{item.title} </h2>
                    </div>
                  </div>

                  <Box sx={{ minWidth: 300 }}>
                    <FormControl fullWidth>
                      <InputLabel
                        className="text-white"
                        id="demo-simple-select-label"
                      >
                        Plateforme
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={age}
                        label="Age"
                        onChange={handleChange}
                      >
                        {item.plateformes &&
                          item.plateformes.map((ab, index) => (
                            <>
                              {ab.support === "Xbox Series" && (
                                <Link
                                  key={item.id}
                                  to={{
                                    pathname: `/Xbox/${item.id}/${item.title}`,
                                    state: { itemData: item },
                                  }}
                                >
                                  <MenuItem className="text-white" value={10}>
                                    {ab.support}
                                  </MenuItem>
                                </Link>
                              )}

                              {ab.support === "Playstation 5" && (
                                <Link
                                  key={item.id}
                                  to={{
                                    pathname: `/Playstation/${item.id}/${item.title}`,
                                    state: { itemData: item },
                                  }}
                                >
                                  <MenuItem className="text-white" value={10}>
                                    {ab.support}
                                  </MenuItem>
                                </Link>
                              )}
                              {ab.support === "Steam" && (
                                <Link
                                  key={item.id}
                                  to={{
                                    pathname: `/PC/${item.id}/${item.title}`,
                                    state: { itemData: item },
                                  }}
                                >
                                  <MenuItem className="text-white" value={10}>
                                    {ab.support}
                                  </MenuItem>
                                </Link>
                              )}
                              {ab.support === "Rockstar" && (
                                <Link
                                  key={item.id}
                                  to={{
                                    pathname: `/PC_Rockstar/${item.id}/${item.title}`,
                                    state: { itemData: item },
                                  }}
                                >
                                  <MenuItem className="text-white" value={10}>
                                    {ab.support}
                                  </MenuItem>
                                </Link>
                              )}
                            </>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <div class="nk-product-description">
                    <ReadMore text={item.resume} />
                  </div>

                  {/* <div class="nk-gap-2"></div> */}

                  {item.plateformes &&
                    item.plateformes.map((ab, index) => (
                      <>
                        <div class="info">
                          {ab.support === "Steam" && (
                            <>
                              <div className="priceOrigin text-white">
                                {ab.priceOrigin}
                              </div>{" "}
                              <div className="priceSlidePromo ">{ab.promo}</div>{" "}
                              <div class="price text-white">{ab.price}</div>
                            </>
                          )}
                        </div>

                        {ab.support === "Steam" && (
                          <>
                            {ab.Stock === false ? (
                              <>
                                <a class="nk-btn nk-btn-rounded nk-btn-color-main-1">
                                  Hors Stock
                                </a>
                              </>
                            ) : (
                              <>
                                <a
                                  href={ab.buy}
                                  class="nk-btn nk-btn-rounded nk-btn-color-main-1"
                                >
                                  Instant Gaming
                                </a>
                              </>
                            )}
                          </>
                        )}
                      </>
                    ))}
                  <div class="nk-gap-1"></div>

                  <div class="nk-product-meta">
                    <div>
                      <strong>Note</strong>:{" "}
                      <a
                        className={`average-rating ${getRatingColor(
                          averageRating
                        )} ${averageRating >= 4 || averageRating < 2 ? "flash" : ""
                          }`}
                        style={{
                          "--rating-percent": `${(averageRating / 5) * 100}%`,
                        }}
                      >
                        {getRatingDescription(averageRating)}{" "}
                        {getRatingIcon(averageRating)}
                        {/* {calculateAverageRating().toFixed(1)} */}
                      </a>
                    </div>
                    <div>
                      <strong>Categories </strong>:{" "}
                      <a href="#"> {item.genres}</a>
                    </div>
                    {item.about &&
                      item.about.map((ab, index) => (
                        <>
                          <div>
                            <strong>Date de sortie </strong>:{" "}
                            <a href="#">{formatDate(ab.sortie)}</a>
                          </div>
                          <div>
                            <strong>Développeur </strong>:{" "}
                            <a href="#"> {ab.dev}</a>
                          </div>
                          <div>
                            <strong>Editeur</strong>:{" "}
                            <a href="#"> {ab.editeur}</a>
                          </div>
                        </>
                      ))}
                    <div></div>
                  </div>
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

export default Plateformes