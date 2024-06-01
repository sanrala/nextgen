import React, { useState, useMemo, useEffect } from "react";
import HoverVideoPlayer from "react-hover-video-player";
import { Link } from "react-router-dom";
import data from "./../../games.json";
import axios from "axios";

function Popular() {
  const [articles, setArticles] = useState([]);

  const popularGames = data.filter((item) => item.popular === true);
  useEffect(() => {
    setArticles(data.articles); // Charger les données du fichier JSON
  }, []);

  //   const [games, setGames] = useState([]);

  //   useEffect(() => {
  //     // GitHub raw URL to fetch the JSON file
  //     const url = 'https://raw.githubusercontent.com/sanrala/gamesJSON/main/games.json';

  //     const fetchGames = async () => {
  //       try {
  //         const response = await fetch(url);
  //         const data = await response.json();
  //         setGames(data);
  //       } catch (error) {
  //         console.error('Error fetching the games data:', error);
  //       }
  //     };

  //     fetchGames();
  //   }, []);
  //   const popularGames = games.filter(item => item.popular === true);
  //   useEffect(() => {
  //     setArticles(games.articles);
  //   }, []);
  // console.log(games);
  return (
    <div>
      <div class="nk-gap-2"></div>
      <Link
        to={{
          pathname: `/Populaires/`,
        }}
      >
        <h3 class="nk-decorated-h-2">
          <span>
            <span class="text-main-1">Jeux</span> Populaires
          </span>
        </h3>
      </Link>
      <div class="nk-gap"></div>
      <div class="nk-blog-grid">
        <div class="row">
          {popularGames
            .slice(-6)
            .reverse()
            .map((item, id) => (
              <div class="col-md-6 col-lg-4" key={item.id}>
                {/* <!-- START: Post --> */}

                <div class="nk-blog-post">
                {item.plateformes &&
                    item.plateformes.map((v, index) => (
                      <>
                        {v.support === "Steam" && (
                          <Link
                            key={item.id}
                            {...item}
                            to={{
                              pathname: `/PC/${item.id}/${item.support}`,
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
                                <img src={item.imageUrl} alt={item.title} className="img-fluid" />
                              }

                            />
                            {/* <img src={item.imageUrl} alt={item.title} /> */}
                            <span class="nk-post-comments-count">{item.promo}</span>

                            <span class="nk-post-categories">
                              <span class="bg-main-5">{item.genre}</span>
                            </span>
                          </Link>
                        )}
                        {v.support === "Rockstar" && (
                       <Link
                       key={item.id}
                       {...item}
                       to={{
                         pathname: `/PC_Rockstar/${item.id}/${item.support}`,
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
                        )
                        }
                        {v.support === "Battle.net" && (
                           <Link
                           key={item.id}
                           {...item}
                           to={{
                             pathname: `/Battlenet/${item.id}/${item.support}`,
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
                        )
                        }
                      </>
                    ))}
                  <div class="nk-gap"></div>
                  <div className="title_price d-flex justify-content-between align-items-baseline">
                    <h2 class="nk-post-title h4">
                    {item.plateformes &&
                    item.plateformes.map((v, index) => (
                      <>
                        {v.support === "Steam" && (
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
                         )
                        }
                           {v.support === "Rockstar" && (
                    <Link
                      key={item.id}
                      {...item}
                      to={{
                        pathname: `/PC_Rockstar/${item.id}/${item.title}`,
                        state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                      }}
                    >
                      {item.title.slice(0, 17) + "..."}
                    </Link>
                         )
                        }
                           {v.support === "Battle.net" && (
                    <Link
                      key={item.id}
                      {...item}
                      to={{
                        pathname: `/Battlenet/${item.id}/${item.title}`,
                        state: { itemData: item }, // Passer les données de l'élément à la page BlocArticle
                      }}
                    >
                      {item.title.slice(0, 17) + "..."}
                    </Link>
                         )
                        }
                      </>
                    ))}
                    </h2>
                    {item.price}
                  </div>
                  {/* <div class="nk-post-text">
                  <p>{item.resume.slice(0, 190) + "..."}</p>
                </div> */}
                  <div class="nk-gap"></div>
                </div>

                {/* <!-- END: Post --> */}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Popular;
