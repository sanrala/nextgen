import { ListItem } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "./../Components/Header/Header";

import Footer from "./../Components/Footer/Footer";
import gameData from "./../games.json";

import { Link } from "react-router-dom";
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import CircularProgress from "@mui/material/CircularProgress";

function BlocArticle(props) {
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
  var sixLatestNews = allNews;

  const [articles, setArticles] = useState([]);

  const popularGames = gameData.filter((item) => item.popular === true);
  useEffect(() => {
    setArticles(gameData.articles); // Charger les données du fichier JSON
  }, []);
  const preco = gameData.filter(item => item.precommande === true);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };
  
  return (
    <div>
      <Header />
      <div class="nk-gap-1"></div>

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
            <a href="#">Actualités</a>
          </li>

          <li>
            <span class="fa fa-angle-right"></span>
          </li>

          <li>
            <span>Toutes les actualités du jeu vidéo</span>
          </li>
        </ul>
      </div>
      <div class="nk-gap-1"></div>
      {/* // <!-- END: Breadcrumbs --> */}

      <div class="nk-gap-2"></div>

      <div class="container">
        <div className="gallery-container">
          <div className="ima large-image-container ">
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
          <div className="large-image-container">
            <Link
              to={{
                pathname: `/news/${sixLatestNews[1].id}/${sixLatestNews[1].news_id}/`,
              }}
              className="nk-post-img"
            >
              <img
                src={sixLatestNews[1].imageUrl}
                alt={sixLatestNews[1].title}
                className="large-image"
              />
              <span className="nk-post-categories">
                <span className="bg-main-1">NEWS</span>
              </span>
            </Link>
            <div className="image-title-large">{sixLatestNews[1].title}</div>
          </div>
        </div>
        <div class="row vertical-gap">
          <div class="col-lg-8">
            <div class="separator product-panel"></div>
            <div class="separator product-panel"></div>
            {sixLatestNews.slice(2).map((v, index) => {
        // Afficher les dix premiers articles normalement
        if (index < 10) {
          return (
            <div className="nk-blog-post nk-blog-post-border-bottom" key={v.id}>
              <div className="row vertical-gap">
                <div className="col-lg-3 col-md-5">
                  <Link
                    to={`/news/${v.id}/${v.news_id}/`}
                    className="nk-post-img"
                  >
                    <img src={v.imageUrl} alt={v.title} />
                    <span className="nk-post-categories">
                      <span className="bg-main-1">NEWS</span>
                    </span>
                  </Link>
                </div>
                <div className="col-lg-9 col-md-7">
                  <h2 className="nk-post-title h4">
                    <Link to={`/news/${v.id}/${v.news_id}/`}>{v.title}</Link>
                  </h2>
                  <div className="nk-post-date mt-10 mb-10">
                    <span className="fa fa-calendar"></span> {formatDate(v.date)}
                    <span className="fa fa-comments"></span>
                    <a href="#">0 commentaires</a>
                  </div>
                  <div className="nk-post-text">
                    <p>{v.new.slice(0, 200) + "..."}</p>
                    <Link
                      to={`/news/${v.id}/${v.news_id}/`}
                      className="nk-btn nk-btn-rounded nk-btn-color-dark-3 nk-btn-hover-color-main-1"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        // Insérer l'accordéon après le dixième article
        else if (index === 10) {
          return (
            <React.Fragment key="accordion">
               <div className="" style={{direction: "rtl"}}
    >
               
              <button onClick={toggleAccordion} className="accordion-button">
                {isAccordionOpen ? <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z"/>
</svg> : <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z"/>
</svg>}
              </button>
           
              </div>
              {isAccordionOpen && (
                <div>
                  {sixLatestNews.slice(12).map((v) => (
                    <div
                      className="nk-blog-post nk-blog-post-border-bottom"
                      key={v.id}
                    >
                      <div className="row vertical-gap">
                        <div className="col-lg-3 col-md-5">
                          <Link
                            to={`/news/${v.id}/${v.news_id}/`}
                            className="nk-post-img"
                          >
                            <img src={v.imageUrl} alt={v.title} />
                            <span className="nk-post-categories">
                              <span className="bg-main-1">NEWS</span>
                            </span>
                          </Link>
                        </div>
                        <div className="col-lg-9 col-md-7">
                          <h2 className="nk-post-title h4">
                            <Link to={`/news/${v.id}/${v.news_id}/`}>
                              {v.title}
                            </Link>
                          </h2>
                          <div className="nk-post-date mt-10 mb-10">
                            <span className="fa fa-calendar"></span> {formatDate(v.date)}
                            <span className="fa fa-comments"></span>
                            <a href="#">0 commentaires</a>
                          </div>
                          <div className="nk-post-text">
                            <p>{v.new.slice(0, 200) + "..."}</p>
                            <Link
                              to={`/news/${v.id}/${v.news_id}/`}
                              className="nk-btn nk-btn-rounded nk-btn-color-dark-3 nk-btn-hover-color-main-1"
                            >
                              Détails
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        }
        return null;
      })}
          </div>

          <div class="col-lg-4">
          <div class="separator product-panel"></div>
     
            <aside class="nk-sidebar nk-sidebar-right nk-sidebar-sticky">
              <div class="nk-widget"></div>

              <div class="nk-widget nk-widget-highlighted">
                <h4 class="nk-widget-title">
                  <span>
                    <span class="text-main-1">Les</span> Précommandes
                  </span>
                </h4>
                <div class="nk-widget-content">
                {preco.map((item) => (
                      <div class="nk-widget-post">
                        <Link
                          key={item.id}
                          {...item}
                          to={{
                            pathname: `/PC-Steam/${item.id}/${item.title}`,
                            state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          class="nk-post-image"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                          />
                        </Link>
                        <h3 class="nk-post-title">
                          <Link
                            key={item.id}
                            {...item}
                            to={{
                              pathname: `/PC-Steam/${item.id}/${item.title}`,
                              state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                            }}
                          >
                            {item.title.slice(0, 20) + "..."}
                          </Link>
                        </h3>
<div className="d-flex justify-content-between align-items-baseline">
                        <div class="nk-product-price">{item.price}
                       
                        </div>
                        <div className="date">{item.dateSortie}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div class="nk-widget nk-widget-highlighted">
                <h4 class="nk-widget-title">
                  <span>
                    <span class="text-main-1">les</span> Populaires
                  </span>
                </h4>
                <div class="nk-widget-content">
                {popularGames
                    .slice(-6)
                    .reverse()
                    .map((item, id) => (
                      <div class="nk-widget-post">
                        <Link
                          key={item.id}
                          {...item}
                          to={{
                            pathname: `/PC-Steam/${item.id}/${item.title}`,
                            state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                          }}
                          class="nk-post-image"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                          />
                        </Link>
                        <h3 class="nk-post-title">
                          <Link
                            key={item.id}
                            {...item}
                            to={{
                              pathname: `/PC-Steam/${item.id}/${item.title}`,
                              state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                            }}
                          >
                            {item.title}
                          </Link>
                        </h3>

                        <div class="nk-product-price">{item.price}</div>
                      </div>
                    ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div class="separator product-panel"></div>
      <div class="separator product-panel"></div>

      <Footer />
    </div>

    // {/* <!-- START: Page Background --> */}

    // {/* <!-- END: Page Background --> */}
  );
}

export default BlocArticle;
