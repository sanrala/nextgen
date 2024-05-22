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
                      <img src={item.imageUrl} alt={item.title} />
                      <div className="priceBloc d-flex flex-start flex-column justify-content-center ">
                        <h1 class="nk-post-title h4">{item.title}</h1>
                        <div class="subinfos">
                          <a
                            href="https://www.instant-gaming.com/fr/pc/steam/"
                            class="platform steam"
                          >
                            <div class="single platform-ps">
                            <svg xmlns="http://www.w3.org/2000/svg" height="32" width="36" viewBox="0 0 576 512"><path fill="#fbfaff" d="M570.9 372.3c-11.3 14.2-38.8 24.3-38.8 24.3L327 470.2v-54.3l150.9-53.8c17.1-6.1 19.8-14.8 5.8-19.4-13.9-4.6-39.1-3.3-56.2 2.9L327 381.1v-56.4c23.2-7.8 47.1-13.6 75.7-16.8 40.9-4.5 90.9 .6 130.2 15.5 44.2 14 49.2 34.7 38 48.9zm-224.4-92.5v-139c0-16.3-3-31.3-18.3-35.6-11.7-3.8-19 7.1-19 23.4v347.9l-93.8-29.8V32c39.9 7.4 98 24.9 129.2 35.4C424.1 94.7 451 128.7 451 205.2c0 74.5-46 102.8-104.5 74.6zM43.2 410.2c-45.4-12.8-53-39.5-32.3-54.8 19.1-14.2 51.7-24.9 51.7-24.9l134.5-47.8v54.5l-96.8 34.6c-17.1 6.1-19.7 14.8-5.8 19.4 13.9 4.6 39.1 3.3 56.2-2.9l46.4-16.9v48.8c-51.6 9.3-101.4 7.3-153.9-10z"/></svg>
                            </div>
                            Playstation 5
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

                        {item.plateformes  &&
                                item.plateformes.map((ab, index) => (
                                  <>
                        <div class="info">
                        {ab.support === "Playstation 5" && ( 
                          <>
                          <div className="priceOrigin text-white">
                        
                            {ab.priceOrigin}
                          
                          </div>{" "}
                          <div className="priceSlidePromo ">{ab.promo}</div>{" "}
                          <div class="price text-white">{ab.price}</div>
                          </>
                       )}
                        </div>
                        {ab.support === "Playstation 5" && ( 
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
                           href={item.buyPS}
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
                                   {!ab.support === "Playstation 5" ?(
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
                              <img src={v.imageUrl} alt={v.title} />

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
