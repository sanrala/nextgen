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
import Footer from "../Components/Footer/Footer";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/style.css";
import ReadMore from "../Components/ReadMore/ReadMore";
import Header from "../Components/Header/Header";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ava from "./../assets/images/avatar-3.jpg";
import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "../features/userSlice";
import { db, auth, googleProvider } from "../Firebase";

import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Rating from "@mui/material/Rating";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import Actu from "../Components/Actu/Actu"
import VideoHover from "../Components/VideoHover/VideoHover"
import Similar from "../Components/Similar/Similar"
import Config from "../Components/Config/Config"
import Screen from "../Components/Screen/Screen"
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  setDoc,
  doc,
  getDoc
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
  console.log(id);
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

  useEffect(() => {
    // Mettre à jour la note globale dans Firestore
    const updateAverageRating = async () => {
      const totalRating = comments.reduce(
        (acc, comment) => acc + parseInt(comment.rating),
        0
      );
      const averageRating = totalRating / comments.length || 0;

      if (id) {
        const gameRef = doc(db, "games", id);
        const gameSnapshot = await getDoc(gameRef);

        if (gameSnapshot.exists()) {
          await updateDoc(gameRef, {
            averageRating: averageRating,
          });
        } else {
          await setDoc(gameRef, {
            gameId: id,
            averageRating: averageRating,
          });
        }
      }
    };

    updateAverageRating();
  }, [comments, id]);


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


  // Fonction pour nettoyer le titre
  const cleanTitle = (title) => {
    return title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  };
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
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0,0,256,256">
                          <g fill="#f9f9f9" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" ><g transform="scale(5.33333,5.33333)"><path d="M24,4c-7.16,0 -11.107,2.237 -14.025,4.425c-3.201,2.401 -5.662,6.511 -5.765,6.685l1.817,1.079c-1.083,1.92 -2.027,4.535 -2.027,7.811c0,1.53 0.189,3.014 0.516,4.447c0.015,0.078 0.019,0.158 0.035,0.235l0.024,-0.005c2.002,8.31 9.191,14.602 17.944,15.248c0.483,0.048 0.967,0.075 1.45,0.075v-0.002c0.011,0 0.021,0.002 0.031,0.002c11.028,0 20,-8.972 20,-20c0,-11.028 -8.972,-20 -20,-20zM22.992,34c-3.305,-0.005 -5.992,-2.694 -5.992,-6c0,-3.309 2.691,-6 6,-6c1.757,0 3.119,0.697 4.162,2.132c0.567,0.78 1.648,3.356 -0.136,5.876l1.62,1.147c-1.288,1.897 -3.511,2.784 -5.468,2.835c-0.063,0.002 -0.123,0.01 -0.186,0.01zM30.993,22.768c-2.273,-3.438 -5.929,-5.726 -9.973,-5.726c-6.628,0 -12.02,5.374 -12.02,11.979c0,0.454 0.033,0.891 0.068,1.327l-0.733,0.255c-0.374,-0.885 -0.661,-1.814 -0.882,-2.768c-0.635,-3.372 0.245,-7.033 2.339,-9.612c2.243,-2.763 5.751,-4.223 10.144,-4.223c6.019,0 10.481,4.133 11.711,8.54zM24,41c-0.41,0 -0.811,-0.033 -1.214,-0.062c-5.427,-0.528 -10.786,-4.664 -10.786,-11.917c0,-3.844 2.444,-7.122 5.862,-8.4c-2.331,1.628 -3.862,4.326 -3.862,7.379c0,4.958 4.03,8.991 8.985,8.999v0.001c0.003,0 0.005,0 0.008,0c0.003,0 0.005,0 0.008,0c0.291,0 0.588,-0.019 0.887,-0.046c6.203,-0.466 11.112,-5.671 11.112,-12.016c0,-6.592 -6.187,-13.938 -15.064,-13.938c-5.038,0 -8.415,1.624 -10.624,3.462l-0.6,-0.55c0.847,-1.06 1.91,-2.223 3.062,-3.087c2.65,-1.987 5.964,-3.825 12.226,-3.825c9.374,0 17,7.626 17,17c0,9.374 -7.626,17 -17,17z"></path></g></g>
                        </svg>
                      </div>
                      Ubisoft
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
                                    pathname: `/Xbox/${item.id}/${cleanTitle(item.title)}`,
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
                                    pathname: `/Playstation/${item.id}/${cleanTitle(item.title)}`,
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
                                    pathname: `/PC/${item.id}/${cleanTitle(item.title)}`,
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
                                    pathname: `/PC_Rockstar/${item.id}/${cleanTitle(item.title)}`,
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
                                <div >
                                  <a
                                    target="_blank"
                                    href={ab.buy}
                                    class="nk-btn nk-btn-rounded nk-btn-color-main-1"
                                  >
                                    Instant Gaming
                                  </a>
                                </div>
                                <div className="mt-8">
                                  <a
                                    target="_blank"
                                    href={ab.buySteam}
                                    class="nk-btn nk-btn-rounded nk-btn-color-main-1"
                                  >
                                    Steam
                                  </a>
                                </div>
                              </>

                            )}
                          </>
                        )}
                        {ab.support === "Ubisoft" && (

                          <>
                            <div className="mt-8">
                              <a
                                target="_blank"
                                href={ab.buy}
                                class="nk-btn nk-btn-rounded nk-btn-color-main-1"
                              >
                                Instant Gaming
                              </a>
                            </div>
                            <div className="mt-8">
                              <a
                                target="_blank"
                                href={ab.buyUbisoft}
                                class="nk-btn nk-btn-rounded nk-btn-color-main-1"
                              >
                                Ubisoft Connect
                              </a>
                            </div>

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
            <div class="nk-gap-3"></div>
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
