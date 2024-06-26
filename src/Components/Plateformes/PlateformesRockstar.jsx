import React, { useState, useRef, useEffect } from "react";
import gameData from "../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import ReadMore from "../ReadMore/ReadMore";
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
  
<>
{item ? (
            <div class="col-md-6">
                  <div class="subinfos">
                  <a href="" class="platform steam">
                      <div class="single platform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 64 64">
                          <path fill="url(#VVci68TESUPE9SF_mOydEa_Y9ACIcuVAdi9_gr1)" d="M62.98,58.41C62.77,60.49,60.9,62,58.81,62H4c-2.34,0-4.22-2.03-3.98-4.41	C0.23,55.51,2.1,54,4.19,54H5c1.11,0,2-0.9,2-2c0-0.55-0.22-1.05-0.58-1.41C6.06,50.22,5.56,50,5,50c-1.65,0-3-1.35-3-3s1.35-3,3-3	h17V32H5c-2.34,0-4.22-2.03-3.98-4.41C1.23,25.51,3.1,24,5.19,24H8.5c1.93,0,3.5-1.57,3.5-3.5S10.43,17,8.5,17h-2	c-2.4,0-4.36-1.87-4.49-4.24C2,12.67,2,12.59,2,12.5c0-1.24,0.5-2.37,1.32-3.18C4.13,8.5,5.26,8,6.5,8h13.23	c0-0.01,0.01-0.01,0.01-0.02C20.46,7.86,21,7.25,21,6.5C21,5.67,20.33,5,19.5,5h-4c-1.47,0-2.64-1.26-2.49-2.76	C13.14,0.94,14.34,0,15.64,0H48.5c1.47,0,2.64,1.26,2.49,2.76C50.86,4.06,49.66,5,48.36,5H45.5C44.67,5,44,5.67,44,6.5	S44.67,8,45.5,8h14c1.47,0,2.64,1.26,2.49,2.76c-0.13,1.3-1.33,2.24-2.63,2.24H59c-1.1,0-2,0.9-2,2s0.9,2,2,2h0.81	c2.09,0,3.96,1.51,4.17,3.59C64.22,22.97,62.33,25,60,25H42v7h17c1.65,0,3,1.35,3,3s-1.35,3-3,3h-9c-1.38,0-2.5,1.12-2.5,2.5	S48.62,43,50,43h10.5c1.92,0,3.5,1.58,3.5,3.5S62.42,50,60.5,50H59c-1.1,0-2,0.9-2,2s0.9,2,2,2C61.33,54,63.22,56.03,62.98,58.41z"></path><linearGradient id="VVci68TESUPE9SF_mOydEb_Y9ACIcuVAdi9_gr2" x1="32" x2="32" y1="-440" y2="-364.17" gradientTransform="matrix(1 0 0 -1 0 -384)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#feaa53"></stop><stop offset=".612" stop-color="#ffcd49"></stop><stop offset="1" stop-color="#ffde44"></stop></linearGradient><path fill="url(#VVci68TESUPE9SF_mOydEb_Y9ACIcuVAdi9_gr2)" d="M55,20v26c0,5.5-4.5,10-10,10H19c-5.5,0-10-4.5-10-10V20c0-5.5,4.5-10,10-10h26	C50.5,10,55,14.5,55,20z"></path><polygon fill="#212121" points="36.101,41.144 38.643,43.108 38.181,39.758 40.722,38.025 37.949,38.025 37.372,34.791 35.523,38.025 32.52,38.025 34.253,39.874 32.866,42.993"></polygon><linearGradient id="VVci68TESUPE9SF_mOydEc_Y9ACIcuVAdi9_gr3" x1="32" x2="32" y1="18.362" y2="44.251" gradientUnits="userSpaceOnUse"><stop offset=".122" stop-color="#5e6d7b"></stop><stop offset=".191" stop-color="#5d6b79"></stop><stop offset="1" stop-color="#515c69"></stop></linearGradient><path fill="url(#VVci68TESUPE9SF_mOydEc_Y9ACIcuVAdi9_gr3)" d="M48,35.715h-8.087l-1.271-7.509l-4.505,7.509h-0.185l-0.97-1.617	c-0.115-0.116-0.347-0.809-0.115-3.235c0.115-1.617-0.116-2.657-0.578-3.35c1.617-0.924,2.426-2.31,2.657-4.39	c0.116-1.733-0.231-3.119-1.155-4.043c-1.271-1.617-3.581-1.848-5.314-1.848h-8.549l-0.231,0.924l-3.35,15.827L16,35.368h6.238	l0.231-0.924l1.04-4.968h2.195c0.578,0,0.809,0.231,0.809,0.231c0.231,0.231,0.462,1.04,0.231,3.235	c-0.116,1.271,0.115,2.079,0.231,2.195l0.289,0.578l4.217,4.621l-3.812,8.433l8.318-4.852l5.892,4.505l-1.155-7.509L48,35.715z M23.162,25.664l1.04-4.274c0,0,3.581,0,3.928,0c1.155,0,2.195,0.578,1.848,2.195c-0.347,1.502-1.617,2.079-2.773,2.079	C25.82,25.664,23.162,25.664,23.162,25.664z"></path><path fill="#fff" d="M29.863,36.87h4.968l3.235-5.43l0.924,5.43h5.43l-4.968,3.466l0.809,5.43l-4.274-3.235l-5.661,3.35	l2.657-5.776L29.863,36.87z"></path>
                        </svg>
                      </div>
                      Rockstar
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
</>
  )
}

export default Plateformes