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
import HoverVideoPlayer from "react-hover-video-player";
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/dist/photoswipe.css'
import Footer from "../Components/Footer/Footer";
import { Gallery, Item } from 'react-photoswipe-gallery'
import 'photoswipe/style.css';
import ReadMore from "../Components/ReadMore/ReadMore"
import Header from "../Components/Header/Header";

import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "../features/userSlice";
import { db, auth, googleProvider } from '../Firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp  } from "firebase/firestore";

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Rating from '@mui/material/Rating';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import Config from "../Components/Config/Config"
import Actu from "../Components/Actu/Actu"
import VideoHover from "../Components/VideoHover/VideoHover"
import Similar from "../Components/Similar/Similar"
import Screen from "../Components/Screen/Screen"
const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled,
  },
}));

const customIcons = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" />,
    label: 'Very Dissatisfied',
  },
  2: {
    icon: <SentimentDissatisfiedIcon color="error" />,
    label: 'Dissatisfied',
  },
  3: {
    icon: <SentimentSatisfiedIcon color="warning" />,
    label: 'Neutral',
  },
  4: {
    icon: <SentimentSatisfiedAltIcon color="success" />,
    label: 'Satisfied',
  },
  5: {
    icon: <SentimentVerySatisfiedIcon color="success" />,
    label: 'Very Satisfied',
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
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
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

  const [activeTab, setActiveTab] = useState('description');

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
  const [newComment, setNewComment] = useState({ title: "", message: "", rating: 0 });

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
      [name]: value
    }));
  };

  const handleRatingChange = (event) => {
    setNewComment((prevComment) => ({
      ...prevComment,
      rating: parseInt(event.target.value)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const userName = userN.displayName || "Anonymous" ;
    const userPhoto = userN.photoURL || "https://zupimages.net/up/24/22/cib6.png";

    try {
      await addDoc(collection(db, "comments"), {
        gameId: id,
        ...newComment,
        userName,
        userPhoto,
        createdAt: serverTimestamp()
      });
      setNewComment({ title: "", message: "", rating: 0 });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const calculateAverageRating = () => {
    const totalRating = comments.reduce((acc, comment) => acc + parseInt(comment.rating), 0);
    return (totalRating / comments.length) || 0;
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
                  <VideoHover/>

                    <div class="nk-gap-1"></div>
                    <Screen/>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="subinfos">
                    <a href="" class="platform steam">
                      <div class="single platform">
                      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 48 48">
<path fill="#0288D1" d="M38.072,21.627c0,0,3.288,0.167,3.288-1.768c0-2.527-4.378-4.806-4.378-4.806s0.685-1.456,1.113-2.269c0.428-0.813,1.633-3.987,1.741-4.712c0.136-0.911-0.071-1.198-0.071-1.198c-0.298,1.953-3.476,7.575-3.728,7.768c-3.102-1.454-7.363-1.859-7.363-1.859S24.504,4,20.582,4c-3.889,0-3.87,7.521-3.87,7.521s-1.099-2.133-2.478-2.133c-2.016,0-2.678,3.051-2.678,6.358c-3.982,0-7.332,0.89-7.632,0.976c-0.3,0.086-1.242,0.771-0.813,0.685c0.871-0.279,4.963-0.912,8.545-0.601c0.197,3.144,2.032,7.238,2.032,7.238s-3.935,5.701-3.935,9.773c0,1.072,0.401,3.182,3.227,3.182c2.366,0,5.089-1.574,5.59-1.863c-0.437,0.624-0.76,1.811-0.76,2.355c0,0.257,0.099,0.779,0.519,1.181c0.666-0.666,1.325-1.325,2.134-2.134c-0.874-0.16-0.992-0.808-0.992-0.974c0-0.588,0.46-1.283,0.46-1.283s2.126-1.437,2.26-1.59l1.571,2.931c0,0-1.608,0.953-2.872,0.953c-0.159,0-0.3-0.013-0.426-0.036c-0.81,0.81-1.469,1.469-2.134,2.134c0.311,0.298,0.794,0.531,1.57,0.531c2.344,0,4.962-1.797,4.962-1.797s2.472,4.109,4.585,5.992c0.57,0.508,1.114,0.6,1.114,0.6s-2.099-2.022-4.865-7.23c2.57-1.589,5.247-5.336,5.247-5.336s0.315,0.01,2.756,0.01c3.825,0,9.258-0.805,9.258-3.845C42.956,24.462,38.072,21.627,38.072,21.627z M38.499,19.738c0,1.109-1.056,1.096-1.056,1.096l-0.802,0.053l-2.446-1.176c0,0,1.43-2.205,1.764-2.82C36.214,17.038,38.499,18.468,38.499,19.738z M15.372,11.864c0.571,0,1.131,0.695,1.361,1.284c0,0.389,0.203,2.662,0.203,2.662l-3.301-0.124C13.635,12.708,14.802,11.864,15.372,11.864z M15.031,32.539c-1.803,0-2.176-1.005-2.176-1.91c0-2.049,1.635-4.914,1.635-4.914s1.831,3.854,5.03,5.481C17.932,32.127,16.623,32.539,15.031,32.539z M24.832,34.976c-0.769-1.346-1.337-2.752-1.337-2.752s3.162,0.205,4.86-1.552c-1.059,0.477-2.746,1.077-4.711,0.896l8.527-8.948c-0.175-0.21-1.101-0.857-1.328-0.966c-1.223,1.472-5.977,6.557-10.38,9.074c-5.574-3.041-6.745-11.988-6.863-13.846l3.045,0.292c0,0-1.144,2.029-1.144,3.522c0,1.493,0.178,1.572,0.178,1.572s-0.038-2.603,1.569-4.613c1.223,6.518,2.5,9.858,3.495,11.848c0.507-0.21,1.451-0.629,1.451-0.629s-2.813-8.108-2.656-13.596c0.887-0.474,2.074-0.952,3.428-1.203c-0.033-0.351-0.107-0.702-0.259-1.053c-1.023,0.238-2.121,0.619-3.149,1.223c0.09-3.056,1.119-5.823,2.937-5.823c1.797,0,4.364,4.244,4.364,4.244s-1.896-0.17-4.152,0.355c0.152,0.351,0.226,0.702,0.259,1.053c0.594-0.11,1.217-0.181,1.867-0.181c5.609,0,10.118,2.415,10.118,2.415l-1.765,2.464c0,0-1.573-2.848-3.792-3.355c1.171,0.873,2.482,2.027,3.163,3.688c-4.648-1.818-10.257-2.778-12.057-2.988c-0.157,0.664-0.136,1.612-0.136,1.612s7.523,1.389,12.997,4.522C33.325,29.105,25.863,34.365,24.832,34.976z M31.958,29.856c0,0,2.337-3.065,2.298-7.126c0,0,3.773,2.337,3.773,4.617C38.03,29.894,31.958,29.856,31.958,29.856z"></path><path fill="#01579B" d="M17.808,37.492c0-0.544,0.323-1.731,0.76-2.355c0.738-0.372,1.361-0.856,1.361-0.856s-0.46,0.695-0.46,1.283c0,0.167,0.118,0.814,0.992,0.974c0.126,0.023,0.267,0.036,0.426,0.036c1.264,0,2.872-0.953,2.872-0.953C18.594,40.25,17.808,37.558,17.808,37.492z M18.645,29.397l-0.062,0.03l-0.075,0.044c-0.293,0.172-0.568,0.315-0.836,0.44c0.553,0.49,1.167,0.939,1.848,1.285c0.294-0.14,0.737-0.362,0.944-0.467C19.795,30.364,19.193,29.91,18.645,29.397z M13.402,32.043c-0.419-0.375-0.547-0.907-0.547-1.414c0-2.049,1.635-4.914,1.635-4.914l-0.803-1.67c0,0-4.048,6.088-0.298,8.026C13.397,32.048,13.393,32.068,13.402,32.043z M37.963,27.785c-0.655,2.104-6.005,2.071-6.005,2.071l-1.017,1.578c0,0,0.303,0.009,2.373,0.01C33.314,31.444,37.554,31.098,37.963,27.785z M33.23,24.446c-0.001,0,0.346,0.222,0.801,0.574c0.144-0.714,0.233-1.481,0.225-2.291c-0.198-0.118-0.704-0.389-0.893-0.476c-0.004,0.727-0.107,1.432-0.262,2.12C33.151,24.401,33.199,24.428,33.23,24.446C33.23,24.446,33.23,24.446,33.23,24.446z M38.499,19.738c0,1.109-1.056,1.096-1.056,1.096l-0.802,0.053l1.43,0.739c4.616-0.189,1.067-3.781-2.112-4.735C36.214,17.038,38.499,18.468,38.499,19.738z M21.933,8.525c0.179-0.062,0.365-0.1,0.562-0.1c1.797,0,4.364,4.244,4.364,4.244l1.815,0.113c0,0-0.417-0.876-1.108-2.073C26.616,9.171,23.693,7.641,21.933,8.525z M15.188,10.188c-1.781-0.188-1.729,4.938-1.553,5.499c0-2.978,1.167-3.822,1.737-3.822c0.571,0,1.131,0.695,1.361,1.284c-0.025-0.878-0.022-1.628-0.022-1.628S16,10.344,15.188,10.188z M21.557,14.33c0.01-0.348,0.044-0.677,0.082-1.002c-0.696,0.227-1.403,0.521-2.081,0.919c-0.017,0.419,0.003,0.607-0.02,1.033c0.56-0.299,1.25-0.594,2.015-0.838C21.555,14.406,21.556,14.372,21.557,14.33z M24.811,34.976c-0.769-1.346-1.337-2.752-1.337-2.752s3.162,0.205,4.86-1.552c-1.059,0.477-2.746,1.077-4.711,0.896c-0.416,0.432-0.916,0.765-1.456,1.123l1.571,2.931C23.738,35.622,24.934,34.903,24.811,34.976z M25.672,36.77c0.241-0.149-0.834,0.637-0.834,0.637s2.472,4.109,4.585,5.992c0.57,0.508,1.114,0.6,1.114,0.6S28.438,41.978,25.672,36.77z M39.766,6.873c-0.298,1.953-3.476,7.575-3.728,7.768c-0.31-0.145,0.945,0.411,0.945,0.411s0.685-1.456,1.113-2.269c0.428-0.813,1.633-3.987,1.741-4.712C39.972,7.16,39.766,6.873,39.766,6.873z M34.952,16.312l-1.765,2.464c0,0-1.573-2.848-3.792-3.355c0.894,0.667,1.868,1.5,2.583,2.594c0-0.004,0-0.01,0-0.015c0,0.005,0,0.011,0,0.015c0.221,0.339,0.42,0.701,0.581,1.093c0.919,0.35,1.713,0.634,1.637,0.603c0,0,1.43-2.205,1.764-2.82C36.054,16.946,34.952,16.312,34.952,16.312z M16.936,15.811l-3.301-0.124c-0.052,0.334-0.032,0.855-0.034,1.197l3.045,0.292c0,0-1.144,2.029-1.144,3.522c0,1.493,0.178,1.572,0.178,1.572s-0.033-2.312,1.31-4.261c-0.004-0.004-0.008-0.005-0.011-0.009c0.004,0.004,0.008,0.006,0.011,0.009c0.082-0.119,0.167-0.236,0.259-0.352C17.041,16.479,16.936,15.811,16.936,15.811z M11.555,15.747c-3.982,0-7.332,0.89-7.632,0.976c-0.3,0.086-1.242,0.771-0.813,0.685c0.871-0.279,4.963-0.912,8.545-0.601C11.582,16.146,11.555,15.747,11.555,15.747z"></path>
</svg>
                      </div>
                      Battle.net
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
                                    pathname: `/PC-Steam/${item.id}/${item.title}`,
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
                <li class="nav-item"
                >
                  <a
                    className={activeTab === 'description' ? 'active nav-link' : 'nav-link'}
                    onClick={() => handleTabChange('description')}
                  >
                    Description
                  </a>
                </li>
                <li class="nav-item"
                >
                  <a
                    className={activeTab === 'comment' ? 'active nav-link' : 'nav-link'}
                    onClick={() => handleTabChange('comment')}
                  >
                    Commentaires ({comments.length})
                  </a>
                </li>
              </ul>

              <div class="tab-content">
                {/* <!-- START: Tab Description --> */}

                <div
                  role="tabpanel"
                  className={activeTab === 'description' ? 'tab-pane fade show active' : 'tab-pane fade'}
                  class="tab-pane fade show active"
                  id="tab-description"

                >
                  <div class="nk-gap"></div>

                  <div class="nk-gap"></div>
                  {!item.gifs ? null : (
                    <div className="text-center">
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

                <div role="tabpanel"
                  className={activeTab === 'comment' ? 'tab-pane fade show active' : 'tab-pane fade'}
                  class="tab-pane fade"
                  id="tab-reviews">
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


                </div>

                {/* <!-- END: Tab Reviews --> */}
              </div>
            </div>
            {/* <div class="nk-gap-3"></div> */}
            <Config/>


            <div class="nk-gap-3"></div>
            <Actu/>
            <div class="nk-gap"></div>
            <div class="nk-gap-3"></div>
            <Similar/>
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
             <Footer/>
    </div>
  );
}

export default Product;
