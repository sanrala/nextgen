import { ListItem } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../Components/Header/Header";
import { Container, Row, Col, Modal } from "react-bootstrap";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import dataGame from "../popular.json";
import gameData from "../games.json";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

function BlocArticle(props) {
  const opts = {
    height: "600",
    width: "1050",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  // Ajouter une classe spécifique en fonction de la largeur de l'écran
  if (window.innerWidth < 1050 || window.innerHeight < 600) {
    opts.width = "100%"; // Utilise la largeur totale de l'écran
  }

  const [item, setItem] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    // Récupérer l'ID depuis l'URL

    // Recherchez l'élément correspondant dans le fichier JSON
    const selectedItem = dataGame.find((item) => item.id === parseInt(id));

    // Mettre à jour l'état avec les données de l'élément sélectionné
    setItem(selectedItem);
  }, [id]);
  const [selectedImage, setSelectedImage] = useState(null);

  const openFullScreen = (index) => {
    setSelectedImage(index);
  };

  const closeFullScreen = () => {
    setSelectedImage(null);
  };

  const [age, setAge] = React.useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <div>
      <Header />
      <div class="nk-gap-1"></div>

      <div class="container">
        {item ? (
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
              <a href="#">{item.title}</a>
            </li>

            <li>
              <span class="fa fa-angle-right"></span>
            </li>

            <li>
              <span>{item.title}</span>
            </li>
          </ul>
        ) : (
          // Code à exécuter lorsque item est null
          <div>Chargement en cours...</div>
        )}
      </div>
      <div class="nk-gap-1"></div>
      {/* // <!-- END: Breadcrumbs --> */}

      <div class="nk-gap-2"></div>

      <div class="container">
        {item ? (
          <div class="row vertical-gap">
            <div class="">
              {/* <!-- START: Post --> */}
              {/* <img
                class="nk-page-backgroundBlog-top"
                src={item.backImage}
                alt=""
              /> */}
              <div class="nk-blog-post nk-blog-post-single">
                {/* <!-- START: Post Text --> */}
                <div class="nk-post-text mt-0">
                  <div className="panel   ">
                    <div class="nk-post-imgBloc">
                      <img src={item.imageUrl} alt={item.title} className="img-fluid" />
                      <div className="priceBloc d-flex flex-start flex-column justify-content-center ">
                        <h1 class="nk-post-title h4">{item.title}</h1>
                        <div class="subinfos">
                          <a
                            href="https://www.instant-gaming.com/fr/pc/steam/"
                            class="platform steam"
                          >
                            <div class="single platform-xbox">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="32"
                                width="32"
                                viewBox="0 0 512 512"
                              >
                                <path d="M369.9 318.2c44.3 54.3 64.7 98.8 54.4 118.7-7.9 15.1-56.7 44.6-92.6 55.9-29.6 9.3-68.4 13.3-100.4 10.2-38.2-3.7-76.9-17.4-110.1-39C93.3 445.8 87 438.3 87 423.4c0-29.9 32.9-82.3 89.2-142.1 32-33.9 76.5-73.7 81.4-72.6 9.4 2.1 84.3 75.1 112.3 109.5zM188.6 143.8c-29.7-26.9-58.1-53.9-86.4-63.4-15.2-5.1-16.3-4.8-28.7 8.1-29.2 30.4-53.5 79.7-60.3 122.4-5.4 34.2-6.1 43.8-4.2 60.5 5.6 50.5 17.3 85.4 40.5 120.9 9.5 14.6 12.1 17.3 9.3 9.9-4.2-11-.3-37.5 9.5-64 14.3-39 53.9-112.9 120.3-194.4zm311.6 63.5C483.3 127.3 432.7 77 425.6 77c-7.3 0-24.2 6.5-36 13.9-23.3 14.5-41 31.4-64.3 52.8C367.7 197 427.5 283.1 448.2 346c6.8 20.7 9.7 41.1 7.4 52.3-1.7 8.5-1.7 8.5 1.4 4.6 6.1-7.7 19.9-31.3 25.4-43.5 7.4-16.2 15-40.2 18.6-58.7 4.3-22.5 3.9-70.8-.8-93.4zM141.3 43C189 40.5 251 77.5 255.6 78.4c.7 .1 10.4-4.2 21.6-9.7 63.9-31.1 94-25.8 107.4-25.2-63.9-39.3-152.7-50-233.9-11.7-23.4 11.1-24 11.9-9.4 11.2z" />
                              </svg>
                            </div>
                            Xbox Series
                            <div class="spacer"></div>
                          </a>{" "}
                          <div class="preorder">
                            Date de sortie 16 mai 2024{" "}
                          </div>
                        </div>
                        <Box sx={{ minWidth: 300 }}>
                          <FormControl fullWidth>
                            <InputLabel
                              className="text-white"
                              id="demo-simple-select-label"
                            >
                              Plateforme
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={age}
                              label="Age"
                              onChange={handleChange}
                            >
                              {item.plateformes &&
                                item.plateformes.map((ab, index) => (
                                  <>
                                    {ab.support === "Xbox Series" && (
                                      <Link
                                        key={item.id}
                                        to={{
                                          pathname: `/xbox/${item.id}/${item.title}`,
                                          state: { itemData: item },
                                        }}
                                      >
                                        <MenuItem
                                          className="text-white"
                                          value={10}
                                        >
                                          {ab.support}
                                        </MenuItem>
                                      </Link>
                                    )}
                                    {ab.support === "Playstation 5" && (
                                      <Link
                                        key={item.id}
                                        to={{
                                          pathname: `/Playstation/${item.id}/${item.title}`,
                                          state: { itemData: item },
                                        }}
                                      >
                                        <MenuItem
                                          className="text-white"
                                          value={10}
                                        >
                                          {ab.support}
                                        </MenuItem>
                                      </Link>
                                    )}
                                    {ab.support === "Steam" && (
                                      <Link
                                        key={item.id}
                                        to={{
                                          pathname: `/jeux/${item.id}/${item.title}`,
                                          state: { itemData: item },
                                        }}
                                      >
                                        <MenuItem
                                          className="text-white"
                                          value={10}
                                        >
                                          {ab.support}
                                        </MenuItem>
                                      </Link>
                                    )}
                                  </>
                                ))}
                            </Select>
                          </FormControl>
                        </Box>

                        {item.plateformes &&
                                item.plateformes.map((ab, index) => (
                                  <>
                        <div class="info">
                        {ab.support === "Xbox Series" && ( 
                          <>
                          <div className="priceOrigin text-white">
                        
                            {ab.priceOrigin}
                          
                          </div>{" "}
                          <div className="priceSlidePromo ">{ab.promo}</div>{" "}
                          <div class="price text-white">{ab.price}</div>
                          </>
                        )}
                        </div>
                        {ab.support === "Xbox Series" && ( 
                          <>
                         {ab.stock === false ? ( 
                          <>
                        <a
                         
                          class="nk-btn nk-btn-rounded nk-btn-color-white nk-btn-hover-color-main-1"
                        >
                         Hors Stock
                        </a>
                        </>
                         ) :(
                          <>
                          <a
                           href={item.buy}
                            class="nk-btn nk-btn-rounded nk-btn-color-white nk-btn-hover-color-main-1"
                          >
                           Instant Gaming
                          </a>
                          </>
                         
                       )}
                     </>
                       )}
                           </>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div class="separator product-panel"></div>
                  <ul class="nk-breadcrumbs">
                    <li>
                      <span>A propos</span>
                    </li>
                  </ul>
                  <div class="separator product-panel"></div>
                  <div className="panel   ">
                    <div class="nk-post-imgBloc">
                      {/* <div class="headline">
                        <h2>À propos</h2>
                      </div>{" "} */}
                      <div class="text readable">{item.resume}</div>{" "}
                      <div class="nk-post-categories d-flex align-items-center">
                        <div className="cat">
                          <div className="ss_cat">Développeur :</div>

                          <div className="ss_cat">Editeur :</div>
                          <div className="ss_cat">Date de sortie :</div>
                          <div className="ss_cat">Genres :</div>
                        </div>

                        {/* </div> */}
                        {/* <div class="nk-post-categories"> */}

                        <div className="cat__rep">
                          {item.about &&
                            item.about.map((ab, index) => (
                              <div key={index}>
                                <div className="ss_cat_rep"> {ab.dev}</div>
                                <div className="ss_cat_rep"> {ab.editeur}</div>
                                <div className="ss_cat_rep"> {ab.sortie}</div>
                                <div className="ss_cat_rep"> {item.genres}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="separator product-panel"></div>

                  <div class="nk-gap"></div>
                  <blockquote class="nk-blockquote">
                    <div class="nk-blockquote-icon">
                      <span>"</span>
                    </div>
                    <div class="nk-blockquote-content">{item.critique}</div>
                    <div class="nk-blockquote-author">
                      <span>{item.critiqueTitle}</span>
                    </div>
                  </blockquote>

                  {!item.gifs ? (
                    <div>oops</div>
                  ) : (
                    <div className="text-center">
                      {item.gifs &&
                        item.gifs.map((gif, index) => (
                          <div key={index}>
                            <h3 className="h4">{gif.title}</h3>
                            <img className="img-fluid " src={gif.img} alt="" />
                            <div class="nk-gap-2"></div>
                            <p>{gif.texte}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  <div class="separator product-panel"></div>
                  {/* <YouTube class="nk-plain-video" videoId={item.video} opts={opts} /> */}
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
                  <div class="nk-gap-2"></div>
                  <Container>
                    <Row>
                      {item.screen &&
                        item.screen.map((screens, index) => (
                          <Col
                            key={index}
                            xs={6}
                            sm={4}
                            md={3}
                            lg={2}
                            className="mb-3"
                          >
                            <img
                              src={screens.img}
                              className="img-fluid me-2 mb-2"
                              alt={`Image ${index}`}
                              style={{ cursor: "pointer" }}
                              onClick={() => openFullScreen(index)}
                            />
                          </Col>
                        ))}
                    </Row>
                    <Modal
                      show={selectedImage !== null}
                      onHide={closeFullScreen}
                      centered
                      size="xl"
                    >
                      <Modal.Body>
                        {selectedImage !== null && (
                          <img
                            src={item.screen[selectedImage].img}
                            className="img-fluid"
                            alt={`Image ${selectedImage}`}
                          />
                        )}
                      </Modal.Body>
                    </Modal>
                  </Container>

                  <div class="separator product-panel"></div>
                  {item.plateformes &&
                                item.plateformes.map((ab, index) => (
                                  <>
                                   {!ab.support === "Xbox Series" ?(
                    <>
                 <ul class="nk-breadcrumbs">
                    <li>
                      <span>Configurations</span>
                    </li>
                  </ul>
                  <div class="separator product-panel"></div>
                  <div class="specs-container listing-slider">
                    {item.config &&
                      item.config.map((v, index) => (
                        <>
                          <div class="minimal" key={index}>
                            <h3>
                              minimale<span class="asterix">*</span>
                            </h3>{" "}
                            <div class="specs">
                              <li>
                                <strong>OS:</strong> {v.OSmin}
                              </li>
                              <li>
                                <strong>Processor:</strong> {v.PROCmin}
                              </li>
                              <li>
                                <strong>Memory:</strong> {v.MEMmin}
                              </li>
                              <li>
                                <strong>Graphics:</strong> {v.GRAPHmin}
                              </li>
                              <li>
                                <strong>Storage:</strong> {v.HDD}
                              </li>
                            </div>
                          </div>
                          <div class="recommended">
                            <h3>
                              recommandée<span class="asterix">*</span>
                            </h3>{" "}
                            <div class="specs">
                              <li>
                                <strong>OS:</strong> {v.OSmax}
                              </li>
                              <li>
                                <strong>Processor:</strong> {v.PROCmax}
                              </li>
                              <li>
                                <strong>Memory:</strong> {v.MEMmax}
                              </li>
                              <li>
                                <strong>Graphics:</strong>
                                {v.GRAPHmax}
                              </li>
                              <li>
                                <strong>Storage:</strong> {v.HDD}
                              </li>
                            </div>
                          </div>
                        </>
                      ))}
                  </div>
                  </>
  ) : (
    <div className="div"></div>
  )}
     </>
                                ))}

                  <div class="separator product-panel"></div>

                  <ul class="nk-breadcrumbs">
                    <li>
                      <span>L'actualité du jeu</span>
                    </li>
                  </ul>
                  <div class="separator product-panel"></div>
                  {item.news &&
                    item.news.map((v, index) => (
                      <div
                        class="nk-blog-post nk-blog-post-border-bottom"
                        key={v.id}
                      >
                        <div class="row vertical-gap">
                          <div class="col-lg-3 col-md-5">
                            <a class="nk-post-img">
                              <img src={v.imageUrl} alt={v.title} className="img-fluid" />

                              <span class="nk-post-categories">
                                {/* <span class="bg-main-1">{new.genre}</span> */}
                              </span>
                            </a>
                          </div>
                          <div class="col-lg-9 col-md-7">
                            <h2 class="nk-post-title h4">
                              <a>{v.title}</a>
                            </h2>
                            <div class="nk-post-date mt-10 mb-10">
                              <span class="fa fa-calendar"></span> {v.date}
                              <span class="fa fa-comments"></span>{" "}
                              <a href="#">0 commentaires</a>
                            </div>
                            <div class="nk-post-text">
                              <p>{v.new.slice(0, 200) + "..."}</p>
                              <a class="nk-btn nk-btn-rounded nk-btn-color-dark-3 nk-btn-hover-color-main-1">
                                Détails
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  <div class="nk-gap-2"></div>
                  {/* <p>This sounded nonsense to Alice, so she said nothing, but set off at once toward the Red Queen. To her surprise, she lost sight of her in a moment, and found herself walking in at the front-door again. For some minutes Alice stood without speaking, looking out in all directions over the country - and a most curious country it was.</p> */}

                  <div class="nk-gap"></div>
                  <div class="nk-post-share">
                    <span class="h5">Partager:</span>

                    <ul class="nk-social-links-2">
                      <li>
                        <span
                          class="nk-social-facebook"
                          title="Share page on Facebook"
                          data-share="facebook"
                        >
                          <span class="fab fa-facebook"></span>
                        </span>
                      </li>
                      <li>
                        <span
                          class="nk-social-google-plus"
                          title="Share page on Google+"
                          data-share="google-plus"
                        >
                          <span class="fab fa-google-plus"></span>
                        </span>
                      </li>
                      <li>
                        <span
                          class="nk-social-twitter"
                          title="Share page on Twitter"
                          data-share="twitter"
                        >
                          <span class="fab fa-twitter"></span>
                        </span>
                      </li>
                      <li>
                        <span
                          class="nk-social-pinterest"
                          title="Share page on Pinterest"
                          data-share="pinterest"
                        >
                          <span class="fab fa-pinterest-p"></span>
                        </span>
                      </li>

                      {/* <!-- Additional Share Buttons */}
                      <li>
                        <span
                          class="nk-social-linkedin"
                          title="Share page on LinkedIn"
                          data-share="linkedin"
                        >
                          <span class="fab fa-linkedin"></span>
                        </span>
                      </li>
                      <li>
                        <span
                          class="nk-social-vk"
                          title="Share page on VK"
                          data-share="vk"
                        >
                          <span class="fab fa-vk"></span>
                        </span>
                      </li>
                      {/* --> */}
                    </ul>
                  </div>
                </div>
                {/* <!-- END: Post Text --> */}

                {/* <!-- START: Similar Articles --> */}
                <div class="nk-gap-2"></div>
                <h3 class="nk-decorated-h-2">
                  <span>
                    <span class="text-main-1">Articles</span> Similaires
                  </span>
                </h3>
                <div class="nk-gap"></div>

                {/* <div className="slider-container">
                  <Slider {...settings}>
                    {gameData.map((i, id) => (
                      <div>
                        <div
                          className="nk-blog-poste"
                          key={id}
                          style={{ display: item.genre === i.genre ? 'block' : 'none' }}
                        >
                          {item.genre === i.genre ? (
                            <div
                              key={id}
                              // style={{ width: '40%' }}
                            >
                              <a
                                href="blog-article.html"
                                className="nk-post-img"
                              >
                                <img
                                  src={i.imageUrl}
                                  alt={i.title}
                                  style={{
                                    display:
                                      item.genre !== i.genre
                                        ? "hidden"
                                        : "block",
                                  }}
                                />
                                <span className="nk-post-comments-count">
                                  {i.promo}
                                </span>
                              </a>
                              <div className="nk-gap"></div>
                              <h2 className="nk-post-title h4 d-flex justify-content-between">
                                <a href="blog-article.html">{i.title}</a>
                                <span>{i.price}</span>
                              </h2>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div> */}

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
                          <a href="blog-article.html" className="nk-post-img">
                            <img src={i.imageUrl} alt={i.title} />
                            <span className="nk-post-comments-count">
                              {i.promo}
                            </span>
                          </a>
                          <div className="nk-gap"></div>
                          <h2 className="nk-post-title h4 d-flex justify-content-between">
                            <a href="blog-article.html">{i.title}</a>
                            <span>{i.price}</span>
                          </h2>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {/* </Slider> */}
                </div>

                {/* <!-- END: Similar Articles --> */}

                {/* <!-- START: Comments --> */}
                <div id="comments"></div>
                <h3 class="nk-decorated-h-2">
                  <span>
                    <span class="text-main-1">3</span> Comments
                  </span>
                </h3>
                <div class="nk-gap"></div>
                <div class="nk-comments">
                  {/* <!-- START: Comment --> */}
                  <div class="nk-comment">
                    <div class="nk-comment-meta">
                      <img
                        src="assets/images/avatar-2.jpg"
                        alt="Avatar"
                        class="rounded-circle"
                        width="35"
                      />{" "}
                      par <a href="#">pseudo</a> date du jour
                      <a
                        href="#"
                        class="nk-btn nk-btn-rounded nk-btn-color-dark-3 float-right"
                      >
                        répondre
                      </a>
                    </div>
                    <div class="nk-comment-text">
                      <p>ksdjfmsflsdfslkdjfskdjfsjfsmjfmsjfm</p>
                    </div>

                    {/* <!-- START: Comment --> */}

                    {/* <!-- END: Comment --> */}
                  </div>
                  {/* <!-- END: Comment --> */}

                  {/* <!-- START: Comment --> */}

                  {/* <!-- END: Comment --> */}
                </div>
                {/* <!-- END: Comments --> */}

                {/* <!-- START: Reply --> */}
                <div class="nk-gap-2"></div>
                <h3 class="nk-decorated-h-2">
                  <span>
                    <span class="text-main-1">Ecrire</span> une réponse
                  </span>
                </h3>
                <div class="nk-gap"></div>
                <div class="nk-reply">
                  <form action="#" class="nk-form" novalidate="novalidate">
                    <div class="row sm-gap vertical-gap">
                      <div class="col-md-4">
                        <input
                          type="email"
                          class="form-control required"
                          name="email"
                          placeholder="Email *"
                        />
                      </div>
                      <div class="col-md-4">
                        <input
                          type="text"
                          class="form-control required"
                          name="name"
                          placeholder="Name *"
                        />
                      </div>
                      <div class="col-md-4">
                        <input
                          type="text"
                          class="form-control"
                          name="name"
                          placeholder="Website"
                        />
                      </div>
                    </div>
                    <div class="nk-gap-1"></div>
                    <textarea
                      class="form-control required"
                      name="message"
                      rows="5"
                      placeholder="Message *"
                      aria-required="true"
                    ></textarea>
                    <div class="nk-gap-1"></div>
                    <div class="nk-form-response-success"></div>
                    <div class="nk-form-response-error"></div>
                    <button class="nk-btn nk-btn-rounded nk-btn-color-main-1">
                      Valider
                    </button>
                  </form>
                </div>
                {/* <!-- END: Reply --> */}
              </div>
              {/* <!-- END: Post --> */}
            </div>
            {/* <div class="col-lg-4">

                    </div> */}
          </div>
        ) : (
          // Code à exécuter lorsque item est null
          <div>Chargement en cours...</div>
        )}
      </div>

      <div class="nk-gap-2"></div>

      {/* <!-- START: Footer --> */}

      {/* <!-- END: Footer --> */}

      {/* <img
        class="nk-page-background-top"
        src="assets/images/bg-top-5.png"
        alt=""
      />
      <img
        class="nk-page-background-bottom"
        src="assets/images/bg-bottom.png"
        alt=""
      /> */}
    </div>

    // {/* <!-- START: Page Background --> */}

    // {/* <!-- END: Page Background --> */}
  );
}

export default BlocArticle;
