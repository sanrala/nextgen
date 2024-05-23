import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import data from "./../../games.json";
import HoverVideoPlayer from "react-hover-video-player";

function Precommandes() {

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  }

  const preco = data.filter(item => item.precommande === true);
  return (
    <div>
      <div class="nk-gap-2"></div>
      <h3 class="nk-decorated-h-2">
        <span>
          <span class="text-main-1">Jeux</span> en précommandes
        </span>
      </h3>
      <div class="nk-gap"></div>
      <div class="nk-blog-grid">
        <div class="row">
          {preco.map((item) => (
            <>
              {/* {item.precommande === true && ( */}
                <div class="col-md-6 col-lg-4" key={item.id}>
                  {/* <!-- START: Post --> */}

                  <div class="nk-blog-post" key={item.id}>
                    <Link
                      key={item.id}
                      {...item}
                      to={{
                        pathname: `/PC/${item.id}/${item.title}`,
                        state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                      }}
                      class="nk-post-img"
                    >
                      <HoverVideoPlayer
                        className="tot"
                        videoSrc={item.videoHover}
                        style={{
                          // Make the image expand to cover the video's dimensions
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        pausedOverlay={
                          <img src={item.imageUrl} alt={item.title} />
                        }
                       
                      />
                      {/* <img src={item.imageUrl} alt={item.title} /> */}
                      <span class="nk-post-comments-count">{item.promo}</span>

                      <span class="nk-post-categories">
                        <span class="bg-main-5">{item.genre}</span>
                      </span>
                    </Link>
                    <div class="nk-gap"></div>
                    <span class="nk-post-title h4">
                      <Link
                        key={item.id}
                        {...item}
                        to={{
                          pathname: `/PC/${item.id}/${item.title}`,
                          state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                        }}
                      >
                        {item.title.slice(0, 17) + "..."}
                      </Link>
                    </span>
                    {/* <div class="nk-post-text">
                     
                      <p>{item.resume.slice(0, 190) + "..."}</p>
                    </div> */}
                    <div class="nk-gap"></div>
                    <div className="d-flex justify-content-between text-white">
                      <div className="div">
                        <span class="preco ">PRECO </span>{" "}
                        <span class="preco__date">{formatDate(item.dateSortie)}</span>
                        {/* <div class="nk-post-date float-right"> */}
                      </div>
                      {item.price}
                      {/* </div> */}
                    </div>
                  </div>

                  {/* <!-- END: Post --> */}
                </div>
              {/* )} */}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Precommandes;
