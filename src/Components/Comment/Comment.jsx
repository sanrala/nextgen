import React, { useState, useRef, useEffect } from "react";
import gameData from "./../../games.json";
import { Link,useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { db, auth, googleProvider } from "./../../Firebase";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
  } from "firebase/firestore";
import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../../features/userSlice";
function Comment() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [item, setItem] = useState(null);

    const { id, title } = useParams();
    useEffect(() => {
      // Récupérer l'ID depuis l'URL
  
      // Recherchez l'élément correspondant dans le fichier JSON
      const selectedItem = gameData.find((item) => item.id === parseInt(id));
  
      // Mettre à jour l'état avec les données de l'élément sélectionné
      setItem(selectedItem);
    }, [id]);

    const userN = auth.currentUser;
    if (userN !== null) {
      // The user object has basic properties such as display name, email, etc.
      const displayName = userN.displayName;
      const email = userN.email;
      const photoURL = userN.photoURL;
      const emailVerified = userN.emailVerified;
  
      // The user's ID, unique to the Firebase project. Do NOT use
      // this value to authenticate with your backend server, if
      // you have one. Use User.getToken() instead.
      const uid = userN.uid;
    }
    const [activeTab, setActiveTab] = useState("description");

    const handleTabChange = (tab) => {
      setActiveTab(tab);
    };
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({
      title: "",
      message: "",
      rating: 0,
    });
  
    useEffect(() => {
      const selectedItem = gameData.find((item) => item.id === parseInt(id));
      setItem(selectedItem);
  
      const q = query(collection(db, "comments"), where("gameId", "==", id));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const commentsArray = [];
        querySnapshot.forEach((doc) => {
          commentsArray.push({ ...doc.data(), id: doc.id });
        });
        setComments(commentsArray);
      });
  
      return () => unsubscribe();
    }, [id]);
    console.log(comments);
    const handleChanges = (event) => {
      const { name, value } = event.target;
      setNewComment((prevComment) => ({
        ...prevComment,
        [name]: value,
      }));
    };
  
    const handleRatingChange = (event) => {
      setNewComment((prevComment) => ({
        ...prevComment,
        rating: parseInt(event.target.value),
      }));
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      if (!user) {
        console.error("User is not authenticated");
        return;
      }
  
      const userName = userN.displayName || "Anonymous";
      const userPhoto =
        userN.photoURL || "https://zupimages.net/up/24/22/cib6.png";
  
      try {
        await addDoc(collection(db, "comments"), {
          gameId: id,
          ...newComment,
          userName,
          userPhoto,
          createdAt: serverTimestamp(),
        });
        setNewComment({ title: "", message: "", rating: 0 });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    };
  
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
    <div>
           {item ? (
          <div class="nk-tabs">
              <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item">
                  <a
                    className={
                      activeTab === "description"
                        ? "active nav-link"
                        : "nav-link"
                    }
                    onClick={() => handleTabChange("description")}
                  >
                    Description
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    className={
                      activeTab === "comment" ? "active nav-link" : "nav-link"
                    }
                    onClick={() => handleTabChange("comment")}
                  >
                    Commentaires ({comments.length})
                  </a>
                </li>
              </ul>

              <div class="tab-content">
                {/* <!-- START: Tab Description --> */}

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
               
                </div>

                {/* <!-- END: Tab Description --> */}

                {/* <!-- START: Tab Reviews --> */}

                <div
                  role="tabpanel"
                  className={
                    activeTab === "comment"
                      ? "tab-pane fade show active"
                      : "tab-pane fade"
                  }
                  class="tab-pane fade"
                  id="tab-reviews"
                >
                  <div class="nk-gap-2"></div>
                  {/* <!-- START: Reply --> */}
                  <h3 class="h4">Ajouter un commentaire</h3>

                  {user ? (
                    <div className="nk-reply">
     
                      <div className="nk-gap-1"></div>
                      <form onSubmit={handleSubmit} className="nk-form">
                        <div className="d-flex flex-column row vertical-gap sm-gap">
                          <div className="d-flex col-sm-2">
                            <div className="avatar_product">
                              <Avatar
                                src={userN.photoURL}
                                className="me-2"
                                style={{ cursor: "pointer" }}
                              />{" "}
                              {user.displayName}
                            </div>
                          </div>
                          <div className="rating">
    
                            {[...Array(5)].map((_, index) => (
                              <React.Fragment key={index}>
                                <input
                                  type="radio"
                                  id={`review-rate-${index + 1}`}
                                  name="rating"
                                  value={index + 1}
                                  onChange={handleRatingChange}
                                  checked={newComment.rating === index + 1}
                                  style={{ display: "none" }}
                                />
                                <label
                                  htmlFor={`review-rate-${index + 1}`}
                                  style={{ cursor: "pointer" }}
                                >
                                  <span>
                                    {newComment.rating >= index + 1 ? (
                                      <StarIcon />
                                    ) : (
                                      <StarBorderIcon />
                                    )}
                                  </span>
                                </label>
                              </React.Fragment>
                            ))}
                          </div>
                          <div className="col-sm-6">
                            <input
                              type="text"
                              className="form-control required"
                              name="title"
                              placeholder="Titre *"
                              value={newComment.title}
                              onChange={handleChanges}
                              required
                            />
                          </div>
                        </div>
                        <div className="nk-gap-1"></div>
                        <textarea
                          className="form-control required"
                          name="message"
                          rows="5"
                          placeholder="Ton message *"
                          value={newComment.message}
                          onChange={handleChanges}
                          required
                        ></textarea>
                        <div className="nk-gap-1"></div>
                        <button className="nk-btn nk-btn-rounded nk-btn-color-dark-3 float-right">
                          Envoyer
                        </button>
                      </form>
                    </div>
                  ) : (
                    <Link to="/Login">
                      <button className="fa fa-user">Se connecter</button>
                    </Link>
                  )}

                  <div className="clearfix"></div>
                  <div className="nk-gap-2"></div>
                  <div className="nk-comments">
                    <h3>Commentaires</h3>

                    {comments.map((comment) => (
                      <div key={comment.id} className="nk-comment">
                        <div className="nk-comment-meta">
                          <img
                            src={comment.userPhoto}
                            alt={comment.userName}
                            className="rounded-circle"
                            width="35"
                          />{" "}
                          par <a href="#">{comment.userName}</a>{" "}
                          {comment.createdAt
                            ? `le ${new Date(
                              comment.createdAt.seconds * 1000
                            ).toLocaleDateString("fr-FR")}`
                            : ""}
                          <div
                            className="nk-review-rating"
                            data-rating={comment.rating}
                          >
                            {" "}
                            {[...Array(5)].map((_, index) => (
                              <i
                                key={index}
                                className={
                                  comment.rating > index
                                    ? "fa fa-star"
                                    : "far fa-star"
                                }
                              ></i>
                            ))}
                          </div>
                        </div>
                        <div className="nk-comment-text">
                          <p>{comment.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* <!-- END: Reply --> */}

                  <div class="clearfix"></div>
                  <div class="nk-gap-2"></div>
                </div>           
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

export default Comment