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
import ReadMore from "./../Components/ReadMore/ReadMore"
import { Gallery, Item } from 'react-photoswipe-gallery'
import 'photoswipe/style.css';
import Footer from "./../Components/Footer/Footer";
import Header from "./../Components/Header/Header";


import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../features/userSlice";
import { db, auth, googleProvider } from './../Firebase';
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
  const { id } = useParams();
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
                    <div class="nk-gallery-item-box">
                      <a
                        href="assets/images/product-6.jpg"
                        class="nk-gallery-item"
                        data-size="1200x554"
                      >
                        {/* <div class="nk-gallery-item-overlay">
                          <span class="ion-eye"></span>
                        </div> */}
                        <HoverVideoPlayer
                          className="tot"
                          videoSrc={item.videoHover}
                          style={{
                            // Make the image expand to cover the video's dimensions
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          pausedOverlay={
                            <img src={item.imageUrl} alt={item.title} />
                          }
                        />
                      </a>
                    </div>

                    <div class="nk-gap-1"></div>
                    <div class="row vertical-gap sm-gap">
                      {item.screen &&
                        item.screen.slice(1).map((screens, index) => (
                          <Gallery>
                            <Item
                              original={screens.img}
                              thumbnail={screens.img}
                              width="1920"
                              height="1024"
                            >
                              {({ ref, open }) => (
                                // <a class="nk-gallery-item" data-size="622x942">
                                <div class="col-6 col-md-3">
                                  <div class="nk-gallery-item-box">
                                    <img
                                      ref={ref}
                                      onClick={open}
                                      src={screens.img}
                                      className="img-fluid me-2 mb-2"
                                      alt={`Image ${index}`}
                                    />
                                  </div>
                                </div>
                                // </a>
                              )}
                            </Item>
                          </Gallery>
                        ))}
                    </div>
                  </div>
                </div>
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
                    activeTab === "description" ? "active nav-link" : "nav-link"
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
                  Commentaires (3)
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
                    {/* <div className="nk-rating">
              
            {[...Array(5)].map((_, index) => (
                <React.Fragment key={index}>
                  <input
                    type="radio"
                    id={`review-rate-${5 - index}`}
                    name="rating"
                    value={5 - index}
                    onChange={handleRatingChange}
                    checked={newComment.rating === 5 - index}
                    style={{ display: "none" }}
                  />
                  <label htmlFor={`review-rate-${5 - index}`} style={{ cursor: 'pointer' }}>
                    <span>
                      {newComment.rating >= 5 - index ? <StarIcon /> : <StarBorderIcon />}
                    </span>
                  </label>
                </React.Fragment>
              ))}
            </div> */}
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
                          {/* {[...Array(5)].map((_, index) => (
                <React.Fragment key={index}>
                  <input type="radio" id={`review-rate-${5 - index}`} name="rating" value={5 - index} onChange={handleChanges} checked={newComment.rating == 5 - index} />
                  <label htmlFor={`review-rate-${5 - index}`}>
                    <span><i className={newComment.rating >= 5 - index ? "fa fa-star" : "far fa-star"}></i></span>
                  </label>
                </React.Fragment>
              ))} */}

                          {[...Array(5)].map((_, index) => (
                            <React.Fragment key={index}>
                              <input
                                type="radio"
                                id={`review-rate-${5 - index}`}
                                name="rating"
                                value={5 - index}
                                onChange={handleRatingChange}
                                checked={newComment.rating === 5 - index}
                                style={{ display: "none" }}
                              />
                              <label
                                htmlFor={`review-rate-${5 - index}`}
                                style={{ cursor: "pointer" }}
                              >
                                <span>
                                  {newComment.rating >= 5 - index ? (
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
                  {/* <div className="average-rating-container">
            <div
              className={`average-rating ${getRatingColor(averageRating)} ${averageRating >= 4 || averageRating < 2 ? 'flash' : ''}`}
              style={{ "--rating-percent": `${(averageRating / 5) * 100}%` }}
            >
              {averageRating.toFixed(1)}
            </div>
          </div> */}
                  {/* <div className="average-rating-container">
  <div
    className={`average-rating ${getRatingColor(averageRating)} ${averageRating >= 4 || averageRating < 2 ? 'flash' : ''}`}
    style={{ "--rating-percent": `${(averageRating / 5) * 100}%` }}
  >
    {getRatingIcon(averageRating)}
  </div>
</div> */}
                  {comments.map((comment) => (
                    <div key={comment.id} className="nk-comment">
                      <div className="nk-comment-meta">
                        <img
                          src={comment.userPhoto || "default-avatar.png"}
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

                {/* <!-- END: Tab Reviews --> */}
              </div>
            </div>

            <div class="nk-gap-1"></div>
            {item.plateformes &&
              item.plateformes.map((ab, index) => (
                <>
                  {!ab.support === "Playstation 5" ? (
                    <>
                      <h3 class="nk-decorated-h-2">
                        <span>
                          <span class="text-main-1">Configurations</span>
                        </span>
                      </h3>
                      <div class="nk-gap"></div>
                      <div class="specs-container listing-slider">
                        {item.config &&
                          item.config.map((v, index) => (
                            <>
                              <div class="minimal" key={index}>
                                <h3>
                                  minimale<span class="asterix">*</span>
                                </h3>{" "}
                                <div class="specs">
                                  <li>
                                    <strong>OS:</strong> {v.OSmin}
                                  </li>
                                  <li>
                                    <strong>Processor:</strong> {v.PROCmin}
                                  </li>
                                  <li>
                                    <strong>Memory:</strong> {v.MEMmin}
                                  </li>
                                  <li>
                                    <strong>Graphics:</strong> {v.GRAPHmin}
                                  </li>
                                  <li>
                                    <strong>Storage:</strong> {v.HDD}
                                  </li>
                                </div>
                              </div>
                              <div class="recommended">
                                <h3>
                                  recommandée<span class="asterix">*</span>
                                </h3>{" "}
                                <div class="specs">
                                  <li>
                                    <strong>OS:</strong> {v.OSmax}
                                  </li>
                                  <li>
                                    <strong>Processor:</strong> {v.PROCmax}
                                  </li>
                                  <li>
                                    <strong>Memory:</strong> {v.MEMmax}
                                  </li>
                                  <li>
                                    <strong>Graphics:</strong>
                                    {v.GRAPHmax}
                                  </li>
                                  <li>
                                    <strong>Storage:</strong> {v.HDD}
                                  </li>
                                </div>
                              </div>
                            </>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="div"></div>
                  )}
                </>
              ))}
            <div class="nk-gap-3"></div>
            <h3 class="nk-decorated-h-2">
              <span>
                <span class="text-main-1">L'actualité </span> du jeu
              </span>
            </h3>
            {item.news &&
              item.news.map((v, index) => (
                <div class="nk-blog-post nk-blog-post-border-bottom" key={v.id}>
                  <div class="row vertical-gap">
                    <div class="col-lg-3 col-md-5">
                      <a class="nk-post-img">
                        <img src={v.imageUrl} alt={v.title} />

                        <span class="nk-post-categories">
                          {/* <span class="bg-main-1">{new.genre}</span> */}
                        </span>
                      </a>
                    </div>
                    <div class="col-lg-9 col-md-7">
                      <h2 class="nk-post-title h4">
                        <a>{v.title}</a>
                      </h2>
                      <div class="nk-post-date mt-10 mb-10">
                        <span class="fa fa-calendar"></span>{" "}
                        {formatDate(v.date)}
                        <span class="fa fa-comments"></span>{" "}
                        <a href="#">0 commentaires</a>
                      </div>
                      <div class="nk-post-text">
                        <p>{v.new.slice(0, 200) + "..."}</p>
                        <a class="nk-btn nk-btn-rounded nk-btn-color-dark-3 nk-btn-hover-color-main-1">
                          Détails
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            <div class="nk-gap"></div>
            <div class="nk-gap-3"></div>
            <h3 class="nk-decorated-h-2">
              <span>
                <span class="text-main-1">Jeux</span> Similaires
              </span>
            </h3>
            <div class="nk-gap"></div>
            <div class="row vertical-gap">
              <div className="slider-container">
                {/* <Slider {...settings}> */}
                {gameData.map((i, id) => (
                  <div
                    className="nk-blog-poste"
                    key={id}
                    style={{
                      display: item.genre !== i.genre ? "none" : "block",
                    }}
                  >
                    {item.genre === i.genre ? (
                      <div
                        key={id}
                        // style={{ width: '40%' }}
                      >
                        <Link
                          key={i.id}
                          {...i}
                          to={{
                            pathname: `/PC/${i.id}/${i.title}`,
                            state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          class="nk-post-img"
                        >
                          <img src={i.imageUrl} alt={i.title} />
                          <span className="nk-post-comments-count">
                            {i.promo}
                          </span>
                        </Link>
                        <div className="nk-gap"></div>
                        <h2 className="nk-post-title h4 d-flex justify-content-between">
                          <Link
                            key={i.id}
                            {...i}
                            to={{
                              pathname: `/PC/${i.id}/${i.title}`,
                              state: { itemData: i }, // Passer les données de l'élément à la page BlocArticle
                            }}
                            class="nk-post-img"
                          >
                            {i.title}{" "}
                          </Link>
                          <span>{i.price}</span>
                        </h2>
                      </div>
                    ) : null}
                  </div>
                ))}
                {/* </Slider> */}
              </div>

              {/* {gameData.map((i, id) => (
            <div
              class="col-md-6"
              key={id}
              style={{
                display: item.genre !== i.genre ? "none" : "block",
              }}
            >
              {item.genre === i.genre ? (
                   
              <div class="nk-product-cat"  key={id}>
                <a class="nk-product-image" href="store-product.html">
                  <img
                    src={i.imageUrl} alt={i.title}
                  />
                </a>
                <div class="nk-product-cont">
                  <h3 class="nk-product-title h5">
                    <a href="store-product.html">{i.title}</a>
                  </h3>
                  <div class="nk-gap-1"></div>
                  <div class="nk-product-rating" data-rating="3">
                    {" "}
                    <i class="fa fa-star"></i> <i class="fa fa-star"></i>{" "}
                    <i class="fa fa-star"></i> <i class="far fa-star"></i>{" "}
                    <i class="far fa-star"></i>
                  </div>
                  <div class="nk-gap-1"></div>
                  <div class="nk-product-price">{i.price}</div>
                </div>
              </div>
              ) : null}
            </div>
           ))} */}
            </div>
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
