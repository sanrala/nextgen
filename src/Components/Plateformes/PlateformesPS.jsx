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
                <div class="single platform-ps">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32"
                    width="36"
                    viewBox="0 0 576 512"
                  >
                    <path
                      fill="#fbfaff"
                      d="M570.9 372.3c-11.3 14.2-38.8 24.3-38.8 24.3L327 470.2v-54.3l150.9-53.8c17.1-6.1 19.8-14.8 5.8-19.4-13.9-4.6-39.1-3.3-56.2 2.9L327 381.1v-56.4c23.2-7.8 47.1-13.6 75.7-16.8 40.9-4.5 90.9 .6 130.2 15.5 44.2 14 49.2 34.7 38 48.9zm-224.4-92.5v-139c0-16.3-3-31.3-18.3-35.6-11.7-3.8-19 7.1-19 23.4v347.9l-93.8-29.8V32c39.9 7.4 98 24.9 129.2 35.4C424.1 94.7 451 128.7 451 205.2c0 74.5-46 102.8-104.5 74.6zM43.2 410.2c-45.4-12.8-53-39.5-32.3-54.8 19.1-14.2 51.7-24.9 51.7-24.9l134.5-47.8v54.5l-96.8 34.6c-17.1 6.1-19.7 14.8-5.8 19.4 13.9 4.6 39.1 3.3 56.2-2.9l46.4-16.9v48.8c-51.6 9.3-101.4 7.3-153.9-10z"
                    />
                  </svg>
                </div>
                <span style={{ width: "85px" }}>Playstation 5</span>
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
                    {ab.support === "Playstation 5" && (
                      <>
                        <div className="priceOrigin text-white">
                          {ab.priceOrigin}
                        </div>{" "}
                        <div className="priceSlidePromo ">{ab.promo}</div>{" "}
                        <div class="price text-white">{ab.price}</div>
                      </>
                    )}
                  </div>
                  {ab.support === "Playstation 5" && (
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
              <strong>Note</strong>:{" "}
              <a
                className={`average-rating ${getRatingColor(
                  averageRating
                )} ${
                  averageRating >= 4 || averageRating < 2 ? "flash" : ""
                }`}
                style={{
                  "--rating-percent": `${(averageRating / 5) * 100}%`,
                }}
              >
                {getRatingDescription(averageRating)}{" "}
                {getRatingIcon(averageRating)}
              </a>
            </div>

            <div>
              <strong>Categories </strong>: <a href="#"> {item.genres}</a>
            </div>
            {item.about &&
              item.about.map((ab, index) => (
                <>
                  <div>
                    <strong>Date de sortie </strong>:{" "}
                    <a href="#"> {formatDate(ab.sortie)}</a>
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