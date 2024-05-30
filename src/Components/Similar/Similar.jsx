import React, { useState, useRef, useEffect } from "react";
import gameData from "../games.json";
import { Link } from "react-router-dom";

function Similar() {
  return (
    <div>
           <h3 class="nk-decorated-h-2">
              <span>
                <span class="text-main-1">Jeux</span> Similaires
              </span>
            </h3>

            <div class="nk-gap"></div>
            {gameData ? (
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
                          onClick={() => {
                            window.scrollTo(0, 0);
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
              </div>
            ) : (
              // Code à exécuter lorsque item est null
              <Box sx={{ display: "flex" }}>
                <CircularProgress />
              </Box>
            )}

    </div>
  )
}

export default Similar