import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import data from "./../../games.json";
import HoverVideoPlayer from "react-hover-video-player";

function Precommandes() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const today = new Date();
    const updatedGames = data.map(game => {
      const releaseDate = new Date(game.dateSortie);
      if (releaseDate <= today) {
        return { ...game, precommande: false };
      }
      return game;
    });

    // Trier les jeux par date de sortie du plus proche au plus loin
    const sortedGames = updatedGames.sort((a, b) => new Date(a.dateSortie) - new Date(b.dateSortie));

    setGames(sortedGames);
  }, []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  }

  // Filtrer les jeux en précommande et prendre les 6 premiers
  const preco = games.filter(item => item.precommande === true).slice(0, 6);
  return (
    <div>
      <div class="nk-gap-2"></div>
      <Link
        to={{
          pathname: `/PrecoFull/`,
        }}
      >
      <h3 class="nk-decorated-h-2">
        <span>
          <span class="text-main-1">Jeux</span> en précommandes
        </span>
      </h3>
      </Link>
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
