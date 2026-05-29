import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import HoverVideoPlayer from "react-hover-video-player";
import Col from "react-bootstrap/Col";
// import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
// import SellIcon from "@mui/icons-material/Sell";

// import gameData from "../../exclu.json";

function ImgSlider() {
  const [randomImage, setRandomImage] = useState(null);



useEffect(() => {
  const fetchGame = async () => {
    try {
      const res = await fetch("https://api.sm-artweb.fr/api/topsellers-recent");
      const data = await res.json();

      if (!data || data.length === 0) return;

      const game = data[0];

      // 🔥 ON GARDE EXACTEMENT LA STRUCTURE DE TON JSON
      setRandomImage({
        id: game.id,
        title: game.name, // ✔ utilisé dans ton JSX
        imageUrl: game.img, // ✔ utilisé dans ton background
        price: `${parseFloat(game.price).toFixed(2)}€`,
        promo:
          game.retail && game.price
            ? `-${Math.round(
                ((parseFloat(game.retail) - parseFloat(game.price)) /
                  parseFloat(game.retail)) *
                  100
              )}%`
            : "",
        buy: game.url,
      });

    } catch (err) {
      console.error(err);
    }
  };

  fetchGame();
}, []);

  return (
    <div>
      {/* <div class="nk-image-slider" data-autoplay="8000"> */}

      <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Row
          className="lol d-flex flex-wrap "
          // style={{ margin: "100px 0 100px 0" }}
        >
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="first" className="bg">
                {randomImage && (
                  <div key={randomImage.id}>
                  
                    {/* <img
                      class="nk-page-background-top"
                      src={randomImage.imageUrl}
                      alt={`Image ${randomImage.id}`}
                    /> */}
                 
                    <div class="nk-image-slider-content">
                      <Link
                        key={randomImage.id}
                        {...randomImage}
                        to={{
                          pathname: `/jeux/${randomImage.id}`,
                          state: { itemData: randomImage }, // Passer les données de l'élément à la page BlocArticle
                        }}
                      >
                        <h1 class="title__price">{randomImage.title}</h1>
                      </Link>
                      <p class="text-white">
                        <span className="priceSlidePromo">
                          {randomImage.promo}
                        </span>{" "}
                        <span class="price">{randomImage.price}</span>
                      </p>
                      <a
                        href={randomImage.buy}
                        class="nk-btn nk-btn-rounded nk-btn-color-white nk-btn-hover-color-main-1"
                      >
                        Instant Gaming
                      </a>
                    </div>
                
                  </div>
                )}

                {/* </div> */}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* <!-- END: Image Slider --> */}
    </div>
  );
}

export default ImgSlider;
