import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import jsonData from "./../../data.json";
import gameData from "./../../games.json";


function BoxNews() {
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  }
  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  const [previewData, setPreviewData] = useState(null);

  // Fonction pour afficher l'aperçu de l'image, du texte et du titre
  const showPreview = (newsItem) => {
    setPreviewData(newsItem);
  };

  const tite = gameData[0].news[0].title;
  const titles = gameData[0].news.map((news) => news.title);

  // Tableau pour regrouper toutes les nouvelles
  var allNews = [];

  // Regrouper toutes les nouvelles dans un seul tableau
  gameData.forEach(function (obj) {
    if (obj.news) {
      allNews = allNews.concat(obj.news);
    }
  });

  // Fonction pour trier les nouvelles par date croissante
  function sortByDateAscending(a, b) {
    return new Date(b.date) - new Date(a.date);
  }

  // Trier toutes les nouvelles par date croissante
  allNews.sort(sortByDateAscending);
  // Sélectionner les 6 plus récentes nouvelles
  var sixLatestNews = allNews.slice(0, 5);
  // Afficher les nouvelles triées
  console.log("Toutes les nouvelles triées par date croissante :");
  console.log(sixLatestNews);
  


  return (
    <div>
      <Link
        to={{
          pathname: `/actualités/`,
        }}
      >
        <h3 class="nk-decorated-h-2">
          <span>
            <span class="text-main-1">Actualités</span> du jour
          </span>
        </h3>
      </Link>
      <div class="nk-gap"></div>

      <div className="nk-news-box">
        <div className="gallery-container">
          <div className="large-image-container">
            <Link
              to={{
                pathname: `/news/${sixLatestNews[0].id}/${sixLatestNews[0].news_id}/`,
              }}
              className="nk-post-img"
            >
              <img
                src={sixLatestNews[0].imageUrl}
                alt={sixLatestNews[0].title}
                className="large-image"
              />
              <span className="nk-post-categories">
                <span className="bg-main-1">NEWS</span>
              </span>
            </Link>
            <div className="image-title-large">{sixLatestNews[0].title}</div>
          </div>
          <div className="small-images-container">
            {sixLatestNews.slice(1).map((v, index) => (
              <div key={index} className="small-image-container">
                <Link
                  key={v.news_id}
                  {...v}
                  to={{
                    pathname: `/news/${v.id}/${v.news_id}/`,
                  }}
                  className="nk-post-img"
                >
                  <img src={v.imageUrl} alt={v.title} className="small-image" />
                  <span className="nk-post-categories">
                    <span className="bg-main-1">NEWS</span>
                  </span>
                </Link>
                <div className="image-title">{v.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* {sixLatestNews.map((v, id) => (
          <div class="nk-blog-post nk-blog-post-border-bottom" key={v.id}>
            <div class="row vertical-gap">
              <div class="col-lg-3 col-md-5">
                <Link
                  key={v.news_id}
                  {...v}
                  to={{
                    pathname: `/news/${v.id}/${v.news_id}/`,

                  }}
                  className="nk-post-img"
                >

                  <img src={v.imageUrl} alt={v.title} />
                  <span className="nk-post-categories">
                    <span className="bg-main-1">NEWS</span>
                  </span>
                </Link>

              </div>
              <div class="col-lg-9 col-md-7">
                <h2 class="nk-post-title h4">

                  <Link
                    key={v.news_id}
                    {...v}
                    to={{
                      pathname: `/news/${v.id}/${v.news_id}/`,

                    }}
                  >
                    {v.title}
                  </Link>
                </h2>
                <div class="nk-post-date mt-10 mb-10">

                  <span class="fa fa-calendar"></span> {formatDate(v.date)}
                  <span class="fa fa-comments"></span>{" "}
                  <a href="#">0 commentaires</a>
                </div>
                <div class="nk-post-text">
                  <p>{v.new.slice(0, 200) + "..."}</p>
                  <Link
                    key={v.news_id}
                    {...v}
                    to={{
                      pathname: `/news/${v.id}/${v.news_id}/`,

                    }}
                    class="nk-btn nk-btn-rounded nk-btn-color-dark-3 nk-btn-hover-color-main-1"
                  >
                    Détails
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))} */}
      </div>
    </div>
  );
}

export default BoxNews;
