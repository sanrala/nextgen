import React, { useState, useEffect } from "react";

import poste1 from "./../../assets/images/post-1.jpg";

import poste2 from "./../../assets/images/post-2.jpg";

import poste3 from "./../../assets/images/post-3.jpg";

import poste4 from "./../../assets/images/post-4.jpg";

import poste5 from "./../../assets/images/post-5.jpg";

import poste6 from "./../../assets/images/post-6.jpg";
import poste7 from "./../../assets/images/post-7.jpg";
import poste8 from "./../../assets/images/post-8.jpg";
import YouTube from "react-youtube";

import jsonData from "./../../data.json";
import gameData from "./../../games.json";
import newData from "./../../new.json";

function BoxNews() {
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
  const showPreview = (item) => {
    setPreviewData(item);
  };

  const tite = gameData[0].news[0].title;
  const titles = gameData[0].news.map((news) => news.title);

  console.log(titles);

  return (
    <div>
      {/* {gameData.map((item, index) => (
        <div key={index}>
       
          {item.news.slice(-1).map((newsItem, newsIndex) => (
            <p key={newsIndex}>{newsItem.title}</p>
          ))}
        </div>
      ))} */}

      {/* {gameData.map((item, index) => (
        <div
          className="nk-news-box-item "
          onClick={() => showPreview(item)}
          key={index}
        >
          {item.news.slice(-1).map((newsItem, newsIndex) => (
            <>
              <div className="nk-news-box-item-img">
      
                <img
                  key={newsIndex}
                  src={process.env.PUBLIC_URL + newsItem.imageUrl}
                  alt={newsItem.title}
                />
              </div>
              <img
                src={newsItem.imageUrl}
                alt={newsItem.title}
                className="nk-news-box-item-full-img"
              />
              <h3 className="nk-news-box-item-title">{newsItem.title}</h3>
            
              <div className="nk-news-box-item-text">
                      <p>{newsItem.new}</p>
                    </div>
                    <a
                      href="blog-article.html"
                      className="nk-news-box-item-url"
                    >
                      Read More
                    </a>
                    <div className="nk-news-box-item-date">
                      <span className="fa fa-calendar"></span> {newsItem.date}
                    </div>
                 
            </>
          ))}
        </div>
      ))} */}

      <div className="nk-news-box">
        <div className="nk-news-box-list">
          <div className="nano">
            <div className="nano-content">
              {/* {jsonData
                .slice(-6)
                .reverse()
                .map((item) => (
                  <div
                    className="nk-news-box-item "
                    key={item.id}
                    onClick={() => showPreview(item)}
                  >
                    <div className="nk-news-box-item-img">
                      <img
                        src={process.env.PUBLIC_URL + item.imageUrl}
                        alt={item.title}
                      />
                    </div>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="nk-news-box-item-full-img"
                    />
                    <h3 className="nk-news-box-item-title">{item.titleNews}</h3>

                    <span className="nk-news-box-item-categories">
                      <span className="bg-main-4">MMO</span>
                    </span>

                    <div className="nk-news-box-item-text">
                      <p>{item.text}</p>
                    </div>
                    <a
                      href="blog-article.html"
                      className="nk-news-box-item-url"
                    >
                      Read More
                    </a>
                    <div className="nk-news-box-item-date">
                      <span className="fa fa-calendar"></span> {item.date}
                    </div>
                  </div>
                ))} */}
              {gameData.map((item, index) => (
                <div
                  className="nk-news-box-item "
                  onClick={() => showPreview(item)}
                  key={index}
                >
                  {item.news.slice(-1).map((newsItem, newsIndex) => (
                    <>
                      <div className="nk-news-box-item-img">
                        <img
                          key={newsIndex}
                          src={process.env.PUBLIC_URL + newsItem.imageUrl}
                          alt={newsItem.title}
                        />
                      </div>
                      <img
                        src={newsItem.imageUrl}
                        alt={newsItem.title}
                        className="nk-news-box-item-full-img"
                      />
                      <h3 className="nk-news-box-item-title">
                        {newsItem.title}
                      </h3>

                      <div className="nk-news-box-item-text">
                        <p>{newsItem.new}</p>
                      </div>
                      <a
                        href="blog-article.html"
                        className="nk-news-box-item-url"
                      >
                        Read More
                      </a>
                      <div className="nk-news-box-item-date">
                        <span className="fa fa-calendar"></span> {newsItem.date}
                      </div>
                    </>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {previewData ? (
          <div className="nk-news-box-each-info">
            {previewData && (
              <div className="nano">
                <div className="nano-content" key={previewData.id}>
                  {/* <!-- There will be inserted info about selected news--> */}

                  <div className="nk-news-box-item-image">
                    {!previewData.video ? (
                      <img src={previewData.imageUrl} alt={previewData.title} />
                    ) : (
                      <YouTube videoId={previewData.video} opts={opts} />
                    )}
                    <span className="nk-news-box-item-categories">
                      {previewData.genre ? (
                        <span className="bg-main-4">{previewData.genre}</span>
                      ) : (
                        <div className="div"></div>
                      )}
                    </span>
                  </div>
                  <h3 className="nk-news-box-item-title">
                    {previewData.titleNews}
                  </h3>
                  <div className="nk-news-box-item-text">
                    <p>{previewData.text}</p>
                  </div>
                  <a href="blog-article.html" className="nk-news-box-item-more">
                    Read More
                  </a>
                  <div className="nk-news-box-item-date">
                    <span className="fa fa-calendar"></span> {previewData.date}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="nk-news-box-each-info">
            {jsonData
              .slice(-6)
              .reverse()
              .map((item) => (
                <div className="nano">
                  <div className="nano-content" key={item.id}>
                    {/* <!-- There will be inserted info about selected news--> */}

                    <div className="nk-news-box-item-image">
                      {!item.video ? (
                        <img src={item.imageUrl} alt={item.title} />
                      ) : (
                        <YouTube videoId={item.video} opts={opts} />
                      )}
                      <span className="nk-news-box-item-categories">
                        {item.genre ? (
                          <span className="bg-main-4">{item.genre}</span>
                        ) : (
                          <div className="div"></div>
                        )}
                      </span>
                    </div>
                    <h3 className="nk-news-box-item-title">{item.title}</h3>
                    <div className="nk-news-box-item-text">
                      <p>{item.text}</p>
                    </div>
                    <a
                      href="blog-article.html"
                      className="nk-news-box-item-more"
                    >
                      Read More
                    </a>
                    <div className="nk-news-box-item-date">
                      <span className="fa fa-calendar"></span> {item.date}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* <!-- END: Latest News --> */}
    </div>
  );
}

export default BoxNews;
