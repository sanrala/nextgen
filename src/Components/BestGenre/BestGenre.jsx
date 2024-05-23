import React, { useState } from "react";
import { Link } from 'react-router-dom';

import gameData from "./../../games.json"
import HoverVideoPlayer from "react-hover-video-player";

function BestGenre() {
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  }
  const [previewData, setPreviewData] = useState(null);

  // Fonction pour afficher l'aperçu de l'image, du texte et du titre
  const showPreview = (item) => {
    setPreviewData(item);
  };
  const [selectedGenre, setSelectedGenre] = useState("All");

  const changeGenre = (genre) => {
    setSelectedGenre(genre);
  };

  const filteredData =
    selectedGenre === "All"
      ? gameData
      : gameData.filter((item) => item.genre === selectedGenre);

  return (
    <div>
      {/* <div>
        <button onClick={() => changeGenre('All')}>All</button>
        <button onClick={() => changeGenre('Action')}>Action</button>
        <button onClick={() => changeGenre('Comedy')}>Comedy</button>
        <button onClick={() => changeGenre('Drama')}>Drama</button>

      </div>
      <div>
        <h2>Filtered Movies</h2>
        <ul>
          {filteredData.map(item => (
            <li key={item.id}>{item.title} - {item.genre}</li>
          ))}
        </ul>
      </div> */}
      {/* <!-- START: Tabbed News  --> */}
      <div class="nk-gap-3"></div>
      <h3 class="nk-decorated-h-2">
        <span>
          <span class="text-main-1">Catégories</span> de jeux
        </span>
      </h3>
      <div class="nk-gap"></div>
      <div class="nk-tabs">
        {/* <!--
                    Additional Classes:
                        .nav-tabs-fill
                --> */}
        <ul class="nav nav-tabs nav-tabs-fill" role="tablist">
        <li class="nav-item">
            <a
              class="nav-link active"
              role="tab"
              data-toggle="tab"
              onClick={() => changeGenre('All')}
            >
              All
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              role="tab"
              data-toggle="tab"
              onClick={() => changeGenre("Action")}
            >
              Action
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" role="tab" data-toggle="tab"
              onClick={() => changeGenre('MMORPG')}>
              MMORPG
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" role="tab" data-toggle="tab"
              onClick={() => changeGenre('Stratégie')}>
              strategie
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" role="tab" data-toggle="tab"
              onClick={() => changeGenre('Aventure')}>
              Aventure
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" role="tab" data-toggle="tab"
              onClick={() => changeGenre('Course')}>
              Course
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" role="tab" data-toggle="tab"
              onClick={() => changeGenre('RPG')}>
              RPG
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" role="tab" data-toggle="tab"
              onClick={() => changeGenre('Simulation')}>
              Simulation
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" role="tab" data-toggle="tab"
              onClick={() => changeGenre('Combat')}>
              Combat
            </a>
          </li>
        </ul>
        <div class="tab-content">
          <div role="tabpanel" class="tab-pane fade show active" id="tabs-1-1">
            <div class="nk-gap"></div>
            {/* <!-- START: Action Tab --> */}

            {/* {filteredData.map((item) => (
              <div class="nk-blog-post nk-blog-post-border-bottom">
                <a href="blog-article.html" class="nk-post-img">
                  <img src={item.imageUrl} alt={item.title} />

                  <span class="nk-post-categories">
                    <span class="bg-main-1">Action</span>
                  </span>
                </a>
                <div class="nk-gap-1"></div>
                <h2 class="nk-post-title h4">
                  <a href="blog-article.html">{item.title}</a>
                </h2>
                <div class="nk-post-date mt-10 mb-10">
                  <span class="fa fa-calendar"></span> Sep 5, 2018
                  <span class="fa fa-comments"></span>{" "}
                  <a href="#">7 comments</a>
                </div>
                <div class="nk-post-text">
                  <p>{item.text}</p>
                </div>
              </div>
            ))} */}
                  {filteredData.map((v, id) => (
            <div class="nk-blog-post nk-blog-post-border-bottom" key={v.id}>
              <div class="row vertical-gap">
                <div class="col-lg-3 col-md-5">
                <Link
                      key={v.id}
                      {...v}
                      to={{
                        pathname: `/PC/${v.id}/${v.title}`,
                        state: { itemData: v }, // Passer les données de l'élément à la page BlocArticle
                      }} class="nk-post-img">
                  <HoverVideoPlayer
                        className="tot"
                        videoSrc={v.videoHover}
                        style={{
                          // Make the image expand to cover the video's dimensions
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        pausedOverlay={
                    <img
                      src={v.imageUrl}
                      alt={v.title}
                    />
                  }
                       
                  />

                    <span class="nk-post-categories">
                      <span class="bg-main-1">{v.genre}</span>
                    </span>
                  </Link>
                </div>
                <div class="col-lg-9 col-md-7">
                  <h2 class="nk-post-title h4">
                  <Link
                      key={v.id}
                      {...v}
                      to={{
                        pathname: `/PC/${v.id}/${v.title}`,
                        state: { itemData: v }, // Passer les données de l'élément à la page BlocArticle
                      }}>
                    {v.title}
                    </Link>
                  </h2>
                  <div class="nk-post-date mt-10 mb-10">
                    <span class="fa fa-calendar"></span> {formatDate(v.dateSortie)}
                    <span class="fa fa-comments"></span>{" "}
                    <a href="#">0 commentaires</a>
                  </div>
                  <div class="nk-post-text">
                    <p>
                    {v.resume.slice(0, 200)+ "..."}
                    </p>
                    <Link  key={v.id} {...v}  to={{
    pathname: `/PC/${v.id}/${v.title}`,
    state: { itemData: v } // Passer les données de l'élément à la page BlocArticle
  }}
                class="nk-btn nk-btn-rounded nk-btn-color-dark-3 nk-btn-hover-color-main-1"
              >
                Détails
              </Link>
                  </div>
                  
                </div>
                
              </div>
            </div>
         ))} 
         

            {/* <!-- END: Action Tab --> */}
            <div class="nk-gap"></div>
          </div>
 
        </div>
      </div>
      {/* <!-- END: Tabbed News --> */}
    </div>
  );
}

export default BestGenre;
