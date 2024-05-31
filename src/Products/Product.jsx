import React, { useState, useRef, useEffect } from "react";
import gameData from "../games.json";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/dist/photoswipe.css";
import Footer from "./../Components/Footer/Footer";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/style.css";
import ReadMore from "./../Components/ReadMore/ReadMore";
import Header from "./../Components/Header/Header";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ava from "./../assets/images/avatar-3.jpg";
import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../features/userSlice";
import { db, auth, googleProvider } from "./../Firebase";

import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Rating from "@mui/material/Rating";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import Actu from "./../Components/Actu/Actu"
import VideoHover from "./../Components/VideoHover/VideoHover"
import Similar from "./../Components/Similar/Similar"
import Config from "./../Components/Config/Config"
import Screen from "./../Components/Screen/Screen"
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
    color: theme.palette.action.disabled,
  },
}));

const customIcons = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" />,
    label: "Very Dissatisfied",
  },
  2: {
    icon: <SentimentDissatisfiedIcon color="error" />,
    label: "Dissatisfied",
  },
  3: {
    icon: <SentimentSatisfiedIcon color="warning" />,
    label: "Neutral",
  },
  4: {
    icon: <SentimentSatisfiedAltIcon color="success" />,
    label: "Satisfied",
  },
  5: {
    icon: <SentimentVerySatisfiedIcon color="success" />,
    label: "Very Satisfied",
  },
};

function Product(props) {
  function IconContainer(props) {
    const { value, ...other } = props;
    return <span {...other}>{customIcons[value].icon}</span>;
  }

  IconContainer.propTypes = {
    value: PropTypes.number.isRequired,
  };

  const dispatch = useDispatch();
  const user = useSelector(selectUser);

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
  const [item, setItem] = useState(null);
  const { id, title } = useParams();
  useEffect(() => {
    // Récupérer l'ID depuis l'URL

    // Recherchez l'élément correspondant dans le fichier JSON
    const selectedItem = gameData.find((item) => item.id === parseInt(id));

    // Mettre à jour l'état avec les données de l'élément sélectionné
    setItem(selectedItem);
  }, [id]);
  const [age, setAge] = React.useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  const [activeTab, setActiveTab] = useState("description");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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
      <Header />

      <div class="nk-gap-1"></div>
      {item ? (
        <div class="container">
          <ul class="nk-breadcrumbs">
            <li>
              <Link
                to={{
                  pathname: `/`,
                  // Passer les données de l'élément à la page BlocArticle
                }}
              >
                Accueil{" "}
              </Link>
            </li>

            <li>
              <span class="fa fa-angle-right"></span>
            </li>

            <li>
              <a href="store.html">{item.genre}</a>
            </li>

            <li>
              <span class="fa fa-angle-right"></span>
            </li>

            <li>
              <a href="">PC</a>
            </li>

            <li>
              <span class="fa fa-angle-right"></span>
            </li>

            <li>
              <span>{item.title} </span>
            </li>
          </ul>
          <div class="nk-gap-1"></div>

          <div class="container">
            <div class="nk-store-product">
              <div class="row vertical-gap">
                <div class="col-md-6">
                  <div class="nk-popup-gallery">

                    <VideoHover />
                    <div class="nk-gap-1"></div>


                    <Screen />


                  </div>
                </div>




                
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
              </div>
            </div>
            <div class="nk-gap-2"></div>
            {/* SHARE */}
            <div class="nk-post-share">
              <span class="h5">Partager:</span>
              <ul class="nk-social-links-2">
                <li>
                  <span
                    class="nk-social-facebook"
                    title="Share page on Facebook"
                    data-share="facebook"
                  >
                    <span class="fab fa-facebook"></span>
                  </span>
                </li>
                <li>
                  <span
                    class="nk-social-google-plus"
                    title="Share page on Google+"
                    data-share="google-plus"
                  >
                    <span class="fab fa-google-plus"></span>
                  </span>
                </li>
                <li>
                  <span
                    class="nk-social-twitter"
                    title="Share page on Twitter"
                    data-share="twitter"
                  >
                    <span class="fab fa-twitter"></span>
                  </span>
                </li>
                <li>
                  <span
                    class="nk-social-pinterest"
                    title="Share page on Pinterest"
                    data-share="pinterest"
                  >
                    <span class="fab fa-pinterest-p"></span>
                  </span>
                </li>

                <li>
                  <span
                    class="nk-social-linkedin"
                    title="Share page on LinkedIn"
                    data-share="linkedin"
                  >
                    <span class="fab fa-linkedin"></span>
                  </span>
                </li>
                <li>
                  <span
                    class="nk-social-vk"
                    title="Share page on VK"
                    data-share="vk"
                  >
                    <span class="fab fa-vk"></span>
                  </span>
                </li>
              </ul>
            </div>
            <div class="nk-gap-2"></div>
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
                  {/* <p></p> */}
                </div>



                <div class="separator product-panel"></div>
                  {/* <YouTube class="nk-plain-video" videoId={item.video} opts={opts} /> */}
                  <ul class="nk-breadcrumbs">
                    <li>
                      <span>Media</span>
                    </li>
                  </ul>
                  <div class="separator product-panel"></div>
                  <div className="video-container">
                    <iframe
                      title="YouTube Video"
                      src={`https://www.youtube.com/embed/${item.video}`} // Utilisation de la variable videoId pour dynamiquement spécifier l'URL de la vidéo
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div class="nk-gap-2"></div>
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
                        <p>{comment.title}</p>
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
          
            <Config />
            <div class="nk-gap-3"></div>
            <Actu />
            <div class="nk-gap"></div>
            <div class="nk-gap-3"></div>
            <Similar />
          </div>
        </div>
      ) : (
        // Code à exécuter lorsque item est null
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      )}
      <div class="separator product-panel"></div>
      <div class="separator product-panel"></div>
      <Footer />
    </div>
  );
}

export default Product;
