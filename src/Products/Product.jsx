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
import Plateformes from "./../Components/Plateformes/Plateformes";
import Config from "./../Components/Config/Config"
import Screen from "./../Components/Screen/Screen"
import Comment from "./../Components/Comment/Comment";
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
<Plateformes/>
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
           <Comment/>
          
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
