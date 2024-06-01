import React, { useState, useEffect } from "react";
import gameData from "./../../games.json";
import {Link, useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./../../Firebase";
import { Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectUser } from "./../../features/userSlice";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
function LastPosts() {
  const user = useSelector(selectUser);
  const [comments, setComments] = useState([]);
  const [item, setItem] = useState(null);

  const { id, title } = useParams();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      orderBy("rating", "desc"),
      limit(6)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsArray = [];
      querySnapshot.forEach((doc) => {
        commentsArray.push({ ...doc.data(), id: doc.id });
      });
      setComments(commentsArray);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    // Recherchez l'élément correspondant dans le fichier JSON
    const selectedItem = gameData.find((item) => item.id === parseInt(id));

    // Mettre à jour l'état avec les données de l'élément sélectionné
    setItem(selectedItem);
  }, [id]);


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

  return (





    <div class="row vertical-gap">
      <div class="col-lg-12">
      <Link
        to={{
          pathname: `/Populaires/`,
        }}
      >
        <h3 class="nk-decorated-h-2">
          <span>
            <span class="text-main-1">Jeux</span> Populaires
          </span>
        </h3>
      </Link>
        <div class="nk-gap"></div>
        <div class="nk-blog-grid">
          <div class="row">
            {comments.map((comment) => (
              <div class="col-md-6 col-lg-4" key={comment.id}>
                <div class="nk-blog-post">
                  <div class="nk-gap"></div>
           
                    {gameData.map((item) => (
                      <>
                        {item.id == comment.gameId ? (
                          <div key={item.id}>
                            
                            <Link
                    to={`/PC/${item.id}/${item.news_id}/`}
                    className="nk-post-img"
                  >
                              <img src={item.imageUrl} alt="Image du jeu" className="img-fluid" />
                              <span class="nk-post-comments-count">{item.promo}</span>

<span class="nk-post-categories">
  <span class="bg-main-5">{item.genre}</span>
</span>
                            
                            </Link>
                            <div class="nk-gap"></div>
                  <div className="title_price d-flex justify-content-between align-items-baseline">
                    <h2 class="nk-post-title h4">
                    <a href="#">{item.title}</a>
                  </h2>
                  {item.price}
                          </div>
                          </div>
                        ) : (
                          <div className="div"></div>
                        )}
                      </>
                    ))}
               
             
               
                  <div class="nk-gap"></div>
                  {/* <div class="nk-post-text">
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
                       
                      </a>
                  </div> */}

                  <div class="nk-gap"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LastPosts;
