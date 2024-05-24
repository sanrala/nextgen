
import React, { useState, useMemo, useEffect } from "react";
import Header from "./../Components/Header/Header";
import { Link, useParams, useLocation } from "react-router-dom";
import Footer from "./../Components/Footer/Footer";
import gameData from "./../games.json";
import Box from "@mui/material/Box";

import CircularProgress from '@mui/material/CircularProgress';

function BlocArticle() {
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  }
  const { news_id, title, id } = useParams();
  const article = gameData.find(news => news.id === parseInt(id)); // Recherchez l'article correspondant dans le JSON

  if (!article) {
    return <div>Article non trouvé</div>; // Gérez le cas où l'article n'est pas trouvé
  }
  console.log(news_id);
  console.log(title);
  return (
    <div>
      <Header />
      <div class="nk-gap-1"></div>
      <div class="container">
        {article ? (
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
              <a href="">Actualité</a>
            </li>
            <li>
              <span class="fa fa-angle-right"></span>
            </li>
            <li>
            {article.plateformes &&
              article.plateformes.map((v, index) => (
                <>
                {v.support === "Steam" && ( 
            <Link
                    
                    key={article.id}
                    {...article}
                    
                    to={{
                      pathname: `/PC/${article.id}/${article.title}`,
                      state: { itemData: article }, // Passer les données de l'élément à la page BlocArticle
                    }}
                   >{article.title}</Link>
                )} 
                
                {v.support === "Rockstar" && ( 
                  <Link
                    
                  key={article.id}
                  {...article}
                  
                  to={{
                    pathname: `/PC_Rockstar/${article.id}/${article.title}`,
                    state: { itemData: article }, // Passer les données de l'élément à la page BlocArticle
                  }}
                 >{article.title}</Link>
                )
                  }
                   </>
                  ))}

            </li>
        
          </ul>
        ) : (
          // Code à exécuter lorsque item est null
          <Box sx={{ display: 'flex' }}>
            <CircularProgress />
          </Box>
        )}
      </div>
      <div class="nk-gap-1"></div>
      {/* // <!-- END: Breadcrumbs --> */}

      <div class="nk-gap-2"></div>

      <div class="container">
        {article ? (
          <div class="row vertical-gap">
            <div class="">
              {/* <!-- START: Post --> */}
              {/* <img
                class="nk-page-backgroundBlog-top"
                src={item.backImage}
                alt=""
              /> */}
              {article.news && article.news.map((item, id) => (
                <>
                  {item.news_id != news_id ? (
                    null) :
                    (
                      <div class="nk-blog-post nk-blog-post-single">
                        {/* <!-- START: Post Text --> */}
                        <div class="nk-post-text mt-0">
                          <div className="panel   ">
                            <div class="nk-post-imgBloc">
                              <img src={article.imageUrl} alt={article.title} />


                              <div className="priceBloc d-flex flex-start flex-column justify-content-center ">

                                {/* <h3 class="nk-post-title ">{article.title}</h3> */}
                                <div class="subinfos">


                                  <div class="single platform text-white">
                                    <span class="fa fa-calendar"></span>
                                  </div>
                                  Sortie
                                  <div class="spacer"></div>

                                  <div class="preorder text-danger">
                                    {formatDate(article.dateSortie)}{" "}
                                  </div>
                                </div>
                                <div class="nk-post-categories d-flex align-items-center flex-column">
                                  {article.about &&
                                    article.about.map((ab, index) => (
                                      <>
                                        <div className="cat">
                                          <p className="ss_cat">Développeur :    </p>
                                          <p className="ss_cat_rep"> {ab.dev}</p>
                                        </div>

                                        <div className="cat">
                                          <p className="ss_cat">Editeur :    </p>
                                          <p className="ss_cat_rep"> {ab.editeur}</p>
                                        </div>

                                        <div className="cat">
                                          <p className="ss_cat">Genres :    </p>
                                          <p className="ss_cat_rep"> {article.genres}</p>
                                        </div>

                                      </>
                                    ))}
                                  {/* </div> */}
                                  {/* <div class="nk-post-categories"> */}


                                  {/* {article.about &&
                            article.about.map((ab, index) => (
                              <div className="cat__rep" key={index}>
                                <div className="ss_cat_rep"> {ab.dev}</div>
                                <div className="ss_cat_rep"> {ab.editeur}</div>
                          
                                <div className="ss_cat_rep"> {article.genres}</div>
                              </div>
                            ))} */}

                                </div>
                              </div>


                            </div>
                          </div>

                          <div class="separator product-panel"></div>

                          <ul class="nk-breadcrumbs">
                            <li>
                              <span>Actualité</span>
                            </li>
                          </ul>
                          <div class="separator product-panel"></div>

                          <div className="panel   ">
                            <div class="nk-post-imgBloc">

                              <div class="text readable">
                                <h4>{item.title}</h4>
                                {item.new}</div>{" "}

                              <div class="nk-post-categories d-flex align-items-center">

                                <img src={item.imageUrl} alt={item.title} />
                              </div>
                            </div>
                          </div>
                          <div class="separator product-panel"></div>
                          <div className="text-center">
                            {item.new2 != undefined || item.title2 != undefined || item.img != undefined || item.Link != undefined || item.LinkUrl != undefined ? (
                              <div >
                                <h3 className="h4">{item.title2}</h3>
                                <img className="img-fluid " src={item.img}  />
                                <div class="nk-gap-2"></div>
                                <p>{item.new2}</p>
                                <a href={item.LinkUrl} className="know" >{item.Link}</a>
                              </div>
                            ) : (
                              <div className="div"></div>

                            )}
                          </div>
                          <div class="separator product-panel"></div>
                          {item.video !== null ? (
                            <>
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
                            </>
                          ) : null
                          }
                          <div class="nk-gap-2"></div>


                          <h3 class="nk-decorated-h-2">
              <span>
                <span class="text-main-1">Jeux</span> Similaires
              </span>
            </h3>

            <div class="nk-gap"></div>
            <div className="slider-container">
              {/* <Slider {...settings}> */}
              {gameData.map((i, id) => (
                <div
                  className="nk-blog-poste"
                  key={id}
                  style={{
                    display: article.genre !== i.genre ? "none" : "block",
                  }}
                  
                >
                  {article.genre === i.genre ? (
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
                  onClick={() => {
                    window.scrollTo(0, 0)
                  }}
                  class="nk-post-img">
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
                  class="nk-post-img">{i.title}  </Link>
                        <span>{i.price}</span>
                      </h2>
                    </div>
                  ) : null}
                </div>
              ))}
              {/* </Slider> */}
            </div>



                        </div>






                      </div>
                    )
                  }
                </>
              ))}


            </div>

          </div>
        ) : (
          // Code à exécuter lorsque item est null
          <div>Chargement en cours...</div>
        )}
      </div>

      <div class="separator product-panel"></div>
      <div class="separator product-panel"></div>

      <Footer />

      {/* <h2>{article.title}</h2>

     <img src={article.imageUrl} alt="" />
     {article.news && article.news.map((item, id) => ( 
      <>
 { item.news_id != news_id ? (
  null ) :
  (
    <div className="div">
    <h1>{item.title}</h1>
    <img src={item.imageUrl} alt="" />
    <p>{item.new}</p>
    </div>
  )
 }
      </>
     ))} */}





    </div>
  );
}

export default BlocArticle;