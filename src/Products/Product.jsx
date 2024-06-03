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
  updateDoc,
  setDoc,
  doc,
  getDoc
} from "firebase/firestore";
import instant from "./../assets/images/logoGames/instantlogo.png";
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
                                {ab.support === "Ubisoft" && (
                          <Link
                            key={item.id}
                            {...item}
                            to={{
                              pathname: `/Ubisoft/${item.id}/${cleanTitle(item.title)}`,
                              state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                            }}
                            class="nk-post-img"
                          >
                         <MenuItem className="text-white" value={10}>
                                    {ab.support}
                                  </MenuItem>
                          </Link>
                        )
                        }
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
                        <div className="logo_buy d-flex">
                        {ab.support === "Steam" && (
                          <>
                            {ab.Stock === false ? (
                              <>
                                  <a  target="_blank" href={ab.buy} class="instant-logo img-fluid d-flex">

<img src={instant} alt="" />
</a>
                              </>
                            ) : (
                              <>
                                   
                                     <a  target="_blank" href={ab.buy} class="instant-logo img-fluid d-flex">

<img src={instant} alt="" />
</a>
                               
                               
                                <a
                                target="_blank"
                                  href={ab.buySteam}
                                  class=""
                                >
                               <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 48 48">
<linearGradient id="wI0QYw54EXg5_LlgK1HXYa_zNqjI8XKkCv0_gr1" x1="24" x2="24" y1="44" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0176d0"></stop><stop offset="1" stop-color="#16538c"></stop></linearGradient><path fill="url(#wI0QYw54EXg5_LlgK1HXYa_zNqjI8XKkCv0_gr1)" d="M44,24c0,11.04-8.96,20-20,20c-8.39,0-15.57-5.16-18.53-12.48c-0.09-0.2-0.16-0.4-0.24-0.6	c-0.07-0.19-0.14-0.39-0.2-0.59C4.36,28.34,4,26.21,4,24c0-0.17,0-0.35,0.02-0.52c-0.01-0.17,0-0.35,0.01-0.52	C4.57,12.4,13.3,4,24,4C35.04,4,44,12.95,44,24z"></path><circle cx="28.5" cy="18.5" r="3.5" fill="#fff"></circle><path d="M28.5,14.5c-2.21,0-4,1.79-4,4c0,2.21,1.79,4,4,4s4-1.79,4-4C32.5,16.29,30.71,14.5,28.5,14.5z M28.5,22c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5S30.43,22,28.5,22z" opacity=".07"></path><path fill="#fff" d="M28.5,10c-4.69,0-8.5,3.81-8.5,8.5c0,0.18,0.02,0.35,0.03,0.52L17,24c-2.07,0-3.92,0.9-5.2,2.32 L4,24c0,2.21,0.36,4.34,1.03,6.33l5.04,1.61C10.53,35.36,13.45,38,17,38c3.87,0,7-3.13,7-7c0-0.37-0.04-0.73-0.09-1.08l5.06-2.94 C33.44,26.73,37,23.03,37,18.5C37,13.81,33.19,10,28.5,10z M17,36c-2.18,0-4.02-1.41-4.7-3.35l3.75,1.19l0.01-0.01 c0,0.01,0.01,0.01,0.02,0.01c0.14,0.04,0.27,0.08,0.41,0.11C16.66,33.98,16.83,34,17,34c1.66,0,3-1.34,3-3 c0-1.3-0.85-2.41-2.02-2.82c-0.01-0.01-0.03-0.03-0.03-0.03l-3.91-1.16C14.87,26.38,15.89,26,17,26c2.76,0,5,2.24,5,5 S19.76,36,17,36z M28.5,24c-3.04,0-5.5-2.46-5.5-5.5c0-3.04,2.46-5.5,5.5-5.5s5.5,2.46,5.5,5.5C34,21.54,31.54,24,28.5,24z"></path><path d="M33.4,17.49c-0.07-0.32-0.17-0.63-0.29-0.93c-0.06-0.15-0.14-0.3-0.21-0.44 c-0.47-0.85-1.17-1.55-2.02-2.02c-0.14-0.07-0.29-0.15-0.44-0.21c-0.3-0.12-0.61-0.22-0.93-0.29c-0.33-0.06-0.67-0.1-1.01-0.1 s-0.68,0.04-1.01,0.1c-0.32,0.07-0.63,0.17-0.93,0.29c-0.15,0.06-0.3,0.14-0.44,0.21c-0.85,0.47-1.55,1.17-2.02,2.02 c-0.07,0.14-0.15,0.29-0.21,0.44c-0.12,0.3-0.22,0.61-0.29,0.93c-0.06,0.33-0.1,0.67-0.1,1.01c0,0.34,0.04,0.68,0.1,1.01 c0.07,0.32,0.17,0.63,0.29,0.93c0.06,0.15,0.14,0.3,0.21,0.44c0.47,0.85,1.17,1.55,2.02,2.02c0.14,0.07,0.29,0.15,0.44,0.21 c0.3,0.12,0.61,0.22,0.93,0.29c0.33,0.06,0.67,0.1,1.01,0.1s0.68-0.04,1.01-0.1c0.32-0.07,0.63-0.17,0.93-0.29 c0.15-0.06,0.3-0.14,0.44-0.21c0.85-0.47,1.55-1.17,2.02-2.02c0.07-0.14,0.15-0.29,0.21-0.44c0.12-0.3,0.22-0.61,0.29-0.93 c0.06-0.33,0.1-0.67,0.1-1.01C33.5,18.16,33.46,17.82,33.4,17.49z M28.5,22.5c-2.21,0-4-1.79-4-4c0-2.21,1.79-4,4-4s4,1.79,4,4 C32.5,20.71,30.71,22.5,28.5,22.5z M17,26.5c-0.59,0-1.16,0.12-1.7,0.34l2.79,0.83l0.12,0.06l0.01,0.01 c1.37,0.51,2.28,1.81,2.28,3.26c0,1.93-1.57,3.5-3.5,3.5c-0.19,0-0.39-0.02-0.59-0.06h-0.03l-0.01,0.03l-0.47-0.15l-2.63-0.84 c0.82,1.24,2.21,2.02,3.73,2.02c2.48,0,4.5-2.02,4.5-4.5C21.5,28.52,19.48,26.5,17,26.5z M17,26.5c-0.59,0-1.16,0.12-1.7,0.34 l2.79,0.83l0.12,0.06l0.01,0.01c1.37,0.51,2.28,1.81,2.28,3.26c0,1.93-1.57,3.5-3.5,3.5c-0.19,0-0.39-0.02-0.59-0.06h-0.03 l-0.01,0.03l-0.47-0.15l-2.63-0.84c0.82,1.24,2.21,2.02,3.73,2.02c2.48,0,4.5-2.02,4.5-4.5C21.5,28.52,19.48,26.5,17,26.5z M28.5,9 c-5.24,0-9.5,4.26-9.5,9.5c0,0.09,0,0.18,0.01,0.27l-2.58,4.25c-1.84,0.13-3.58,0.9-4.92,2.17l-7.22-2.15l-0.26-0.08 c-0.01,0.17-0.02,0.35-0.01,0.52l0.12,0.04l7.51,2.24c1.34-1.37,3.16-2.18,5.07-2.25l2.8-4.61c-0.01-0.13-0.02-0.27-0.02-0.4 c0-4.96,4.04-9,9-9s9,4.04,9,9c0,4.73-3.67,8.64-8.38,8.97l-4.67,2.72c0.03,0.28,0.05,0.55,0.05,0.81c0,4.14-3.36,7.5-7.5,7.5 c-3.63,0-6.75-2.64-7.38-6.18l-4.39-1.4c0.08,0.2,0.15,0.4,0.24,0.6l3.72,1.19C9.98,36.34,13.23,39,17,39c4.41,0,8-3.59,8-8 c0-0.18-0.01-0.36-0.02-0.54l4.29-2.5c4.92-0.4,8.73-4.51,8.73-9.46C38,13.26,33.74,9,28.5,9z M17,34.5 c-0.19,0-0.39-0.02-0.59-0.06h-0.03l-0.01,0.03l-0.47-0.15l-2.63-0.84c0.82,1.24,2.21,2.02,3.73,2.02c2.48,0,4.5-2.02,4.5-4.5 c0-2.48-2.02-4.5-4.5-4.5c-0.59,0-1.16,0.12-1.7,0.34l2.79,0.83l0.12,0.06l0.01,0.01c1.37,0.51,2.28,1.81,2.28,3.26 C20.5,32.93,18.93,34.5,17,34.5z M17,26.5c-0.59,0-1.16,0.12-1.7,0.34l2.79,0.83l0.12,0.06l0.01,0.01 c1.37,0.51,2.28,1.81,2.28,3.26c0,1.93-1.57,3.5-3.5,3.5c-0.19,0-0.39-0.02-0.59-0.06h-0.03l-0.01,0.03l-0.47-0.15l-2.63-0.84 c0.82,1.24,2.21,2.02,3.73,2.02c2.48,0,4.5-2.02,4.5-4.5C21.5,28.52,19.48,26.5,17,26.5z M17,26.5c-0.59,0-1.16,0.12-1.7,0.34 l2.79,0.83l0.12,0.06l0.01,0.01c1.37,0.51,2.28,1.81,2.28,3.26c0,1.93-1.57,3.5-3.5,3.5c-0.19,0-0.39-0.02-0.59-0.06h-0.03 l-0.01,0.03l-0.47-0.15l-2.63-0.84c0.82,1.24,2.21,2.02,3.73,2.02c2.48,0,4.5-2.02,4.5-4.5C21.5,28.52,19.48,26.5,17,26.5z M17,26.5c-0.59,0-1.16,0.12-1.7,0.34l2.79,0.83l0.12,0.06l0.01,0.01c1.37,0.51,2.28,1.81,2.28,3.26c0,1.93-1.57,3.5-3.5,3.5 c-0.19,0-0.39-0.02-0.59-0.06h-0.03l-0.01,0.03l-0.47-0.15l-2.63-0.84c0.82,1.24,2.21,2.02,3.73,2.02c2.48,0,4.5-2.02,4.5-4.5 C21.5,28.52,19.48,26.5,17,26.5z M17,26.5c-0.59,0-1.16,0.12-1.7,0.34l2.79,0.83l0.12,0.06l0.01,0.01 c1.37,0.51,2.28,1.81,2.28,3.26c0,1.93-1.57,3.5-3.5,3.5c-0.19,0-0.39-0.02-0.59-0.06h-0.03l-0.01,0.03l-0.47-0.15l-2.63-0.84 c0.82,1.24,2.21,2.02,3.73,2.02c2.48,0,4.5-2.02,4.5-4.5C21.5,28.52,19.48,26.5,17,26.5z" opacity=".05"></path><path d="M28.5,9.5c-4.96,0-9,4.04-9,9c0,0.13,0.01,0.27,0.02,0.4l-2.8,4.61c-1.91,0.07-3.73,0.88-5.07,2.25 l-7.51-2.24l-0.12-0.04C4,23.65,4,23.83,4,24l7.8,2.32C13.08,24.9,14.93,24,17,24l3.03-4.98C20.02,18.85,20,18.68,20,18.5 c0-4.69,3.81-8.5,8.5-8.5s8.5,3.81,8.5,8.5c0,4.53-3.56,8.23-8.03,8.48l-5.06,2.94C23.96,30.27,24,30.63,24,31c0,3.87-3.13,7-7,7 c-3.55,0-6.47-2.64-6.93-6.06l-5.04-1.61c0.06,0.2,0.13,0.4,0.2,0.59l4.39,1.4c0.63,3.54,3.75,6.18,7.38,6.18 c4.14,0,7.5-3.36,7.5-7.5c0-0.26-0.02-0.53-0.05-0.81l4.67-2.72c4.71-0.33,8.38-4.24,8.38-8.97C37.5,13.54,33.46,9.5,28.5,9.5z M28.5,24c3.04,0,5.5-2.46,5.5-5.5c0-3.04-2.46-5.5-5.5-5.5S23,15.46,23,18.5C23,21.54,25.46,24,28.5,24z M23.89,20.44 c-0.13-0.3-0.22-0.61-0.29-0.93c-0.06-0.33-0.1-0.67-0.1-1.01c0-0.34,0.04-0.68,0.1-1.01c0.07-0.32,0.16-0.63,0.29-0.93 c0.06-0.15,0.14-0.3,0.21-0.44c0.47-0.85,1.17-1.55,2.02-2.02c0.14-0.07,0.29-0.15,0.44-0.21c0.3-0.13,0.61-0.22,0.93-0.29 c0.33-0.06,0.67-0.1,1.01-0.1s0.68,0.04,1.01,0.1c0.32,0.07,0.63,0.16,0.93,0.29c0.15,0.06,0.3,0.14,0.44,0.21 c0.85,0.47,1.55,1.17,2.02,2.02c0.07,0.14,0.15,0.29,0.21,0.44c0.13,0.3,0.22,0.61,0.29,0.93c0.06,0.33,0.1,0.67,0.1,1.01 c0,0.34-0.04,0.68-0.1,1.01c-0.07,0.32-0.16,0.63-0.29,0.93c-0.06,0.15-0.14,0.3-0.21,0.44c-0.47,0.85-1.17,1.55-2.02,2.02 c-0.14,0.07-0.29,0.15-0.44,0.21c-0.3,0.13-0.61,0.22-0.93,0.29c-0.33,0.06-0.67,0.1-1.01,0.1s-0.68-0.04-1.01-0.1 c-0.32-0.07-0.63-0.16-0.93-0.29c-0.15-0.06-0.3-0.14-0.44-0.21c-0.85-0.47-1.55-1.17-2.02-2.02 C24.03,20.74,23.95,20.59,23.89,20.44z M17,34c-0.17,0-0.34-0.02-0.51-0.05c-0.14-0.03-0.27-0.07-0.41-0.11 c-0.01,0-0.02,0-0.02-0.01l-0.01,0.01l-3.75-1.19C12.98,34.59,14.82,36,17,36c2.76,0,5-2.24,5-5s-2.24-5-5-5 c-1.11,0-2.13,0.38-2.96,0.99l3.91,1.16c0,0,0.02,0.02,0.03,0.03C19.15,28.59,20,29.7,20,31C20,32.66,18.66,34,17,34z M20.5,31 c0-1.45-0.91-2.75-2.28-3.26l-0.01-0.01l-0.12-0.06l-2.79-0.83c0.54-0.22,1.11-0.34,1.7-0.34c2.48,0,4.5,2.02,4.5,4.5 c0,2.48-2.02,4.5-4.5,4.5c-1.52,0-2.91-0.78-3.73-2.02l2.63,0.84l0.47,0.15l0.01-0.03h0.03c0.2,0.04,0.4,0.06,0.59,0.06 C18.93,34.5,20.5,32.93,20.5,31z M17,26c-1.11,0-2.13,0.38-2.96,0.99l3.91,1.16c0,0,0.02,0.02,0.03,0.03C19.15,28.59,20,29.7,20,31 c0,1.66-1.34,3-3,3c-0.17,0-0.34-0.02-0.51-0.05c-0.14-0.03-0.27-0.07-0.41-0.11c-0.01,0-0.02,0-0.02-0.01l-0.01,0.01l-3.75-1.19 C12.98,34.59,14.82,36,17,36c2.76,0,5-2.24,5-5S19.76,26,17,26z M17,35.5c-1.52,0-2.91-0.78-3.73-2.02l2.63,0.84l0.47,0.15 l0.01-0.03h0.03c0.2,0.04,0.4,0.06,0.59,0.06c1.93,0,3.5-1.57,3.5-3.5c0-1.45-0.91-2.75-2.28-3.26l-0.01-0.01l-0.12-0.06 l-2.79-0.83c0.54-0.22,1.11-0.34,1.7-0.34c2.48,0,4.5,2.02,4.5,4.5C21.5,33.48,19.48,35.5,17,35.5z M28.5,13 c-3.04,0-5.5,2.46-5.5,5.5c0,3.04,2.46,5.5,5.5,5.5s5.5-2.46,5.5-5.5C34,15.46,31.54,13,28.5,13z M33.11,20.44 c-0.06,0.15-0.14,0.3-0.21,0.44c-0.47,0.85-1.17,1.55-2.02,2.02c-0.14,0.07-0.29,0.15-0.44,0.21c-0.3,0.13-0.61,0.22-0.93,0.29 c-0.33,0.06-0.67,0.1-1.01,0.1s-0.68-0.04-1.01-0.1c-0.32-0.07-0.63-0.16-0.93-0.29c-0.15-0.06-0.3-0.14-0.44-0.21 c-0.85-0.47-1.55-1.17-2.02-2.02c-0.07-0.14-0.15-0.29-0.21-0.44c-0.13-0.3-0.22-0.61-0.29-0.93c-0.06-0.33-0.1-0.67-0.1-1.01 c0-0.34,0.04-0.68,0.1-1.01c0.07-0.32,0.16-0.63,0.29-0.93c0.06-0.15,0.14-0.3,0.21-0.44c0.47-0.85,1.17-1.55,2.02-2.02 c0.14-0.07,0.29-0.15,0.44-0.21c0.3-0.13,0.61-0.22,0.93-0.29c0.33-0.06,0.67-0.1,1.01-0.1s0.68,0.04,1.01,0.1 c0.32,0.07,0.63,0.16,0.93,0.29c0.15,0.06,0.3,0.14,0.44,0.21c0.85,0.47,1.55,1.17,2.02,2.02c0.07,0.14,0.15,0.29,0.21,0.44 c0.13,0.3,0.22,0.61,0.29,0.93c0.06,0.33,0.1,0.67,0.1,1.01c0,0.34-0.04,0.68-0.1,1.01C33.33,19.83,33.24,20.14,33.11,20.44z M28.5,13c-3.04,0-5.5,2.46-5.5,5.5c0,3.04,2.46,5.5,5.5,5.5s5.5-2.46,5.5-5.5C34,15.46,31.54,13,28.5,13z M33.11,20.44 c-0.06,0.15-0.14,0.3-0.21,0.44c-0.47,0.85-1.17,1.55-2.02,2.02c-0.14,0.07-0.29,0.15-0.44,0.21c-0.3,0.13-0.61,0.22-0.93,0.29 c-0.33,0.06-0.67,0.1-1.01,0.1s-0.68-0.04-1.01-0.1c-0.32-0.07-0.63-0.16-0.93-0.29c-0.15-0.06-0.3-0.14-0.44-0.21 c-0.85-0.47-1.55-1.17-2.02-2.02c-0.07-0.14-0.15-0.29-0.21-0.44c-0.13-0.3-0.22-0.61-0.29-0.93c-0.06-0.33-0.1-0.67-0.1-1.01 c0-0.34,0.04-0.68,0.1-1.01c0.07-0.32,0.16-0.63,0.29-0.93c0.06-0.15,0.14-0.3,0.21-0.44c0.47-0.85,1.17-1.55,2.02-2.02 c0.14-0.07,0.29-0.15,0.44-0.21c0.3-0.13,0.61-0.22,0.93-0.29c0.33-0.06,0.67-0.1,1.01-0.1s0.68,0.04,1.01,0.1 c0.32,0.07,0.63,0.16,0.93,0.29c0.15,0.06,0.3,0.14,0.44,0.21c0.85,0.47,1.55,1.17,2.02,2.02c0.07,0.14,0.15,0.29,0.21,0.44 c0.13,0.3,0.22,0.61,0.29,0.93c0.06,0.33,0.1,0.67,0.1,1.01c0,0.34-0.04,0.68-0.1,1.01C33.33,19.83,33.24,20.14,33.11,20.44z M17,26c-1.11,0-2.13,0.38-2.96,0.99l3.91,1.16c0,0,0.02,0.02,0.03,0.03C19.15,28.59,20,29.7,20,31c0,1.66-1.34,3-3,3 c-0.17,0-0.34-0.02-0.51-0.05c-0.14-0.03-0.27-0.07-0.41-0.11c-0.01,0-0.02,0-0.02-0.01l-0.01,0.01l-3.75-1.19 C12.98,34.59,14.82,36,17,36c2.76,0,5-2.24,5-5S19.76,26,17,26z M17,35.5c-1.52,0-2.91-0.78-3.73-2.02l2.63,0.84l0.47,0.15 l0.01-0.03h0.03c0.2,0.04,0.4,0.06,0.59,0.06c1.93,0,3.5-1.57,3.5-3.5c0-1.45-0.91-2.75-2.28-3.26l-0.01-0.01l-0.12-0.06 l-2.79-0.83c0.54-0.22,1.11-0.34,1.7-0.34c2.48,0,4.5,2.02,4.5,4.5C21.5,33.48,19.48,35.5,17,35.5z" opacity=".07"></path><path d="M28.5,13c-3.04,0-5.5,2.46-5.5,5.5c0,3.04,2.46,5.5,5.5,5.5s5.5-2.46,5.5-5.5 C34,15.46,31.54,13,28.5,13z M33.11,20.44c-0.06,0.15-0.14,0.3-0.21,0.44c-0.47,0.85-1.17,1.55-2.02,2.02 c-0.14,0.07-0.29,0.15-0.44,0.21c-0.3,0.13-0.61,0.22-0.93,0.29c-0.33,0.06-0.67,0.1-1.01,0.1s-0.68-0.04-1.01-0.1 c-0.32-0.07-0.63-0.16-0.93-0.29c-0.15-0.06-0.3-0.14-0.44-0.21c-0.85-0.47-1.55-1.17-2.02-2.02c-0.07-0.14-0.15-0.29-0.21-0.44 c-0.13-0.3-0.22-0.61-0.29-0.93c-0.06-0.33-0.1-0.67-0.1-1.01c0-0.34,0.04-0.68,0.1-1.01c0.07-0.32,0.16-0.63,0.29-0.93 c0.06-0.15,0.14-0.3,0.21-0.44c0.47-0.85,1.17-1.55,2.02-2.02c0.14-0.07,0.29-0.15,0.44-0.21c0.3-0.13,0.61-0.22,0.93-0.29 c0.33-0.06,0.67-0.1,1.01-0.1s0.68,0.04,1.01,0.1c0.32,0.07,0.63,0.16,0.93,0.29c0.15,0.06,0.3,0.14,0.44,0.21 c0.85,0.47,1.55,1.17,2.02,2.02c0.07,0.14,0.15,0.29,0.21,0.44c0.13,0.3,0.22,0.61,0.29,0.93c0.06,0.33,0.1,0.67,0.1,1.01 c0,0.34-0.04,0.68-0.1,1.01C33.33,19.83,33.24,20.14,33.11,20.44z M28.5,13c-3.04,0-5.5,2.46-5.5,5.5c0,3.04,2.46,5.5,5.5,5.5 s5.5-2.46,5.5-5.5C34,15.46,31.54,13,28.5,13z M33.11,20.44c-0.06,0.15-0.14,0.3-0.21,0.44c-0.47,0.85-1.17,1.55-2.02,2.02 c-0.14,0.07-0.29,0.15-0.44,0.21c-0.3,0.13-0.61,0.22-0.93,0.29c-0.33,0.06-0.67,0.1-1.01,0.1s-0.68-0.04-1.01-0.1 c-0.32-0.07-0.63-0.16-0.93-0.29c-0.15-0.06-0.3-0.14-0.44-0.21c-0.85-0.47-1.55-1.17-2.02-2.02c-0.07-0.14-0.15-0.29-0.21-0.44 c-0.13-0.3-0.22-0.61-0.29-0.93c-0.06-0.33-0.1-0.67-0.1-1.01c0-0.34,0.04-0.68,0.1-1.01c0.07-0.32,0.16-0.63,0.29-0.93 c0.06-0.15,0.14-0.3,0.21-0.44c0.47-0.85,1.17-1.55,2.02-2.02c0.14-0.07,0.29-0.15,0.44-0.21c0.3-0.13,0.61-0.22,0.93-0.29 c0.33-0.06,0.67-0.1,1.01-0.1s0.68,0.04,1.01,0.1c0.32,0.07,0.63,0.16,0.93,0.29c0.15,0.06,0.3,0.14,0.44,0.21 c0.85,0.47,1.55,1.17,2.02,2.02c0.07,0.14,0.15,0.29,0.21,0.44c0.13,0.3,0.22,0.61,0.29,0.93c0.06,0.33,0.1,0.67,0.1,1.01 c0,0.34-0.04,0.68-0.1,1.01C33.33,19.83,33.24,20.14,33.11,20.44z M28.5,13c-3.04,0-5.5,2.46-5.5,5.5c0,3.04,2.46,5.5,5.5,5.5 s5.5-2.46,5.5-5.5C34,15.46,31.54,13,28.5,13z M33.11,20.44c-0.06,0.15-0.14,0.3-0.21,0.44c-0.47,0.85-1.17,1.55-2.02,2.02 c-0.14,0.07-0.29,0.15-0.44,0.21c-0.3,0.13-0.61,0.22-0.93,0.29c-0.33,0.06-0.67,0.1-1.01,0.1s-0.68-0.04-1.01-0.1 c-0.32-0.07-0.63-0.16-0.93-0.29c-0.15-0.06-0.3-0.14-0.44-0.21c-0.85-0.47-1.55-1.17-2.02-2.02c-0.07-0.14-0.15-0.29-0.21-0.44 c-0.13-0.3-0.22-0.61-0.29-0.93c-0.06-0.33-0.1-0.67-0.1-1.01c0-0.34,0.04-0.68,0.1-1.01c0.07-0.32,0.16-0.63,0.29-0.93 c0.06-0.15,0.14-0.3,0.21-0.44c0.47-0.85,1.17-1.55,2.02-2.02c0.14-0.07,0.29-0.15,0.44-0.21c0.3-0.13,0.61-0.22,0.93-0.29 c0.33-0.06,0.67-0.1,1.01-0.1s0.68,0.04,1.01,0.1c0.32,0.07,0.63,0.16,0.93,0.29c0.15,0.06,0.3,0.14,0.44,0.21 c0.85,0.47,1.55,1.17,2.02,2.02c0.07,0.14,0.15,0.29,0.21,0.44c0.13,0.3,0.22,0.61,0.29,0.93c0.06,0.33,0.1,0.67,0.1,1.01 c0,0.34-0.04,0.68-0.1,1.01C33.33,19.83,33.24,20.14,33.11,20.44z" opacity=".07"></path>
</svg>
                                </a>
                             
                              </>
                              
                            )}
                          </>
                        )}
                          </div>
{ab.support === "Ubisoft"  && (
                         
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
