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
                       <a
                         href=""
                         class="platform steam"
                       >
                         <div class="single platform-xbox">
                         <svg
                             xmlns="http://www.w3.org/2000/svg"
                             height="32"
                             width="32"
                             viewBox="0 0 512 512"
                           >
                             <path d="M369.9 318.2c44.3 54.3 64.7 98.8 54.4 118.7-7.9 15.1-56.7 44.6-92.6 55.9-29.6 9.3-68.4 13.3-100.4 10.2-38.2-3.7-76.9-17.4-110.1-39C93.3 445.8 87 438.3 87 423.4c0-29.9 32.9-82.3 89.2-142.1 32-33.9 76.5-73.7 81.4-72.6 9.4 2.1 84.3 75.1 112.3 109.5zM188.6 143.8c-29.7-26.9-58.1-53.9-86.4-63.4-15.2-5.1-16.3-4.8-28.7 8.1-29.2 30.4-53.5 79.7-60.3 122.4-5.4 34.2-6.1 43.8-4.2 60.5 5.6 50.5 17.3 85.4 40.5 120.9 9.5 14.6 12.1 17.3 9.3 9.9-4.2-11-.3-37.5 9.5-64 14.3-39 53.9-112.9 120.3-194.4zm311.6 63.5C483.3 127.3 432.7 77 425.6 77c-7.3 0-24.2 6.5-36 13.9-23.3 14.5-41 31.4-64.3 52.8C367.7 197 427.5 283.1 448.2 346c6.8 20.7 9.7 41.1 7.4 52.3-1.7 8.5-1.7 8.5 1.4 4.6 6.1-7.7 19.9-31.3 25.4-43.5 7.4-16.2 15-40.2 18.6-58.7 4.3-22.5 3.9-70.8-.8-93.4zM141.3 43C189 40.5 251 77.5 255.6 78.4c.7 .1 10.4-4.2 21.6-9.7 63.9-31.1 94-25.8 107.4-25.2-63.9-39.3-152.7-50-233.9-11.7-23.4 11.1-24 11.9-9.4 11.2z" />
                           </svg>
                         </div>
                         Xbox Series
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
                              <MenuItem
                                       className="text-white"
                                       value={10}
                                     >
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
                             <MenuItem
                                       className="text-white"
                                       value={10}
                                     >
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
                <MenuItem
                                       className="text-white"
                                       value={10}
                                     >
                                       {ab.support}
                                     </MenuItem>
               </Link>
                       )}
                         {ab.support === "Rockstar"  && (
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
            <div class="info"  key={ab.id}>
                     {ab.support === "Xbox Series" && ( 
                       <>
                       <div className="priceOrigin text-white">
                     
                         {ab.priceOrigin}
                       
                       </div>{" "}
                       <div className="priceSlidePromo ">{ab.promo}</div>{" "}
                       <div class="price text-white">{ab.price}</div>
                       </>
                     )}
                     </div>
                     {ab.support === "Xbox Series" && ( 
                       <>
                      {ab.Stock === false ? ( 
                       <>
                     <a
                      
                       class="nk-btn nk-btn-rounded nk-btn-color-main-1"
                     >
                      Hors Stock
                     </a>
                     </>
                      ) :(
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
                 <div>
             
                 </div>
                 
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