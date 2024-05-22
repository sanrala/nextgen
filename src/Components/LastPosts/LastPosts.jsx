import React from "react";

import poste5mid  from './../../assets/images/post-5-mid.jpg'
import poste6mid  from './../../assets/images/post-6-mid.jpg'

import avatar3 from "./../../assets/images/avatar-3.jpg";



function LastPosts() {
  return (
    <div>




      <div class="row vertical-gap">
        <div class="col-lg-12">
          {/* <!-- START: Latest Posts --> */}
          <h3 class="nk-decorated-h-2">
            <span>
              <span class="text-main-1">Derniers</span> avis
            </span>
          </h3>
          <div class="nk-gap"></div>
          <div class="nk-blog-grid">
            <div class="row">
              <div class="col-md-6">
                {/* <!-- START: Post --> */}
                <div class="nk-blog-post">
                  <a href="blog-article.html" class="nk-post-img">
                    <img
                      src={poste5mid}
                      alt="He made his passenger captain of one"
                    />
                
                  </a>
                  <div class="nk-gap"></div>
                  <h2 class="nk-post-title h4">
                    <a href="blog-article.html">
                      Toujours au top !!
                    </a>
                  </h2>
                  <div class="nk-post-by">
                    <img
                      src={avatar3}
                      alt="Wolfenstein"
                      class="rounded-circle"
                      width="35"
                    />{" "}
                    par <a href="#">Wolfenstein</a> 24 Mars , 2024
                  </div>
                  <div class="nk-gap"></div>
                  <div class="nk-post-text">
                    <p>
                    Achat simple et j'ai reçu mon code de suite sans problème il marche nickel, toujours pas déçu de instant gaming depuis 2021 il son au top.
                    </p>
                  </div>
                  <div class="nk-gap"></div>
                 
                </div>
                {/* <!-- END: Post --> */}
              </div>

              <div class="col-md-6">
                {/* <!-- START: Post --> */}
                <div class="nk-blog-post">
                  <a href="blog-article.html" class="nk-post-img">
                    <img
                      src={poste6mid}
                      alt="At first, for some time, I was not able to answer"
                    />
                   
                  </a>
                  <div class="nk-gap"></div>
                  <h2 class="nk-post-title h4">
                    <a href="blog-article.html">
                   Le jeu que j'attendais à un super prix !!
                    </a>
                  </h2>
                  <div class="nk-post-by">
                    <img
                      src={avatar3}
                      alt="Wolfenstein"
                      class="rounded-circle"
                      width="35"
                    />{" "}
                    par <a href="#">Hellboy</a> 26 Avril , 2024
                  </div>
                  <div class="nk-gap"></div>
                  <div class="nk-post-text">
                    <p>
                    Encore un achat avec instant gaming, rien a dire une nouvelle fois! FIable et rapide .
                    </p>
                  </div>
                  <div class="nk-gap"></div>
                
                </div>
                {/* <!-- END: Post --> */}
              </div>
            </div>
          </div>
          {/* <!-- END: Latest Posts --> */}

         



         

    
        </div>
        {/* <div class="col-lg-4"> */}
          {/* <!--
                START: Sidebar

                Additional Classes:
                    .nk-sidebar-left
                    .nk-sidebar-right
                    .nk-sidebar-sticky
            --> */}
          {/* <aside class="nk-sidebar nk-sidebar-right nk-sidebar-sticky">
            <div class="nk-widget">
              <div class="nk-widget-content">
                <form
                  action="#"
                  class="nk-form nk-form-style-1"
                  novalidate="novalidate"
                >
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Type something..."
                    />
                    <button class="nk-btn nk-btn-color-main-1">
                      <span class="ion-search"></span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div class="nk-widget nk-widget-highlighted">
              <h4 class="nk-widget-title">
                <span>
                  <span class="text-main-1">Latest</span> Video
                </span>
              </h4>
              <div class="nk-widget-content">
                <div
                  class="nk-plain-video"
                  // data-video="https://www.youtube.com/watch?v=Rs6Km7-Iz3k"
                >
                  {" "}
                  <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/Rs6Km7-Iz3k?si=HQUpqwiR4LOT1P_f"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>
            <div class="nk-widget nk-widget-highlighted">
              <h4 class="nk-widget-title">
                <span>
                  <span class="text-main-1">Top 3</span> Recent
                </span>
              </h4>
              <div class="nk-widget-content">
                <div class="nk-widget-post">
                  <a href="blog-article.html" class="nk-post-image">
                    <img src={poste1sm} alt="" />
                  </a>
                  <h3 class="nk-post-title">
                    <a href="blog-article.html">
                      Smell magic in the air. Or maybe barbecue
                    </a>
                  </h3>
                  <div class="nk-post-date">
                    <span class="fa fa-calendar"></span> Sep 18, 2018
                  </div>
                </div>

                <div class="nk-widget-post">
                  <a href="blog-article.html" class="nk-post-image">
                    <img src={poste2sm} alt="" />
                  </a>
                  <h3 class="nk-post-title">
                    <a href="blog-article.html">
                      Grab your sword and fight the Horde
                    </a>
                  </h3>
                  <div class="nk-post-date">
                    <span class="fa fa-calendar"></span> Sep 5, 2018
                  </div>
                </div>

                <div class="nk-widget-post">
                  <a href="blog-article.html" class="nk-post-image">
                    <img src={poste3sm} alt="" />
                  </a>
                  <h3 class="nk-post-title">
                    <a href="blog-article.html">
                      We found a witch! May we burn her?
                    </a>
                  </h3>
                  <div class="nk-post-date">
                    <span class="fa fa-calendar"></span> Aug 27, 2018
                  </div>
                </div>
              </div>
            </div>
            <div class="nk-widget nk-widget-highlighted">
              <h4 class="nk-widget-title">
                <span>
                  <span class="text-main-1">Latest</span> Screenshots
                </span>
              </h4>
              <div class="nk-widget-content">
                <div class="nk-popup-gallery">
                  <div class="row sm-gap vertical-gap">
                    <div class="col-sm-6">
                      <div class="nk-gallery-item-box">
                        <a
                          href="assets/images/gallery-1.jpg"
                          class="nk-gallery-item"
                          data-size="1016x572"
                        >
                          <div class="nk-gallery-item-overlay">
                            <span class="ion-eye"></span>
                          </div>
                          <img src={gallery1thumb} alt="" />
                        </a>
                        <div class="nk-gallery-item-description">
                          <h4>Called Let</h4>
                          Divided thing, land it evening earth winged whose
                          great after. Were grass night. To Air itself saw bring
                          fly fowl. Fly years behold spirit day greater of
                          wherein winged and form. Seed open don't thing midst
                          created dry every greater divided of, be man is.
                          Second Bring stars fourth gathering he hath face
                          morning fill. Living so second darkness. Moveth were
                          male. May creepeth. Be tree fourth.
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="nk-gallery-item-box">
                        <a
                          href="assets/images/gallery-2.jpg"
                          class="nk-gallery-item"
                          data-size="1188x594"
                        >
                          <div class="nk-gallery-item-overlay">
                            <span class="ion-eye"></span>
                          </div>
                          <img src={gallery2thumb} alt="" />
                        </a>
                        <div class="nk-gallery-item-description">
                          Seed open don't thing midst created dry every greater
                          divided of, be man is. Second Bring stars fourth
                          gathering he hath face morning fill. Living so second
                          darkness. Moveth were male. May creepeth. Be tree
                          fourth.
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="nk-gallery-item-box">
                        <a
                          href="assets/images/gallery-3.jpg"
                          class="nk-gallery-item"
                          data-size="625x350"
                        >
                          <div class="nk-gallery-item-overlay">
                            <span class="ion-eye"></span>
                          </div>
                          <img src={gallery3thumb} alt="" />
                        </a>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="nk-gallery-item-box">
                        <a
                          href="assets/images/gallery-4.jpg"
                          class="nk-gallery-item"
                          data-size="873x567"
                        >
                          <div class="nk-gallery-item-overlay">
                            <span class="ion-eye"></span>
                          </div>
                          <img src={gallery4thumb} alt="" />
                        </a>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="nk-gallery-item-box">
                        <a
                          href="assets/images/gallery-5.jpg"
                          class="nk-gallery-item"
                          data-size="471x269"
                        >
                          <div class="nk-gallery-item-overlay">
                            <span class="ion-eye"></span>
                          </div>
                          <img src={gallery5thumb} alt="" />
                        </a>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="nk-gallery-item-box">
                        <a
                          href="assets/images/gallery-6.jpg"
                          class="nk-gallery-item"
                          data-size="472x438"
                        >
                          <div class="nk-gallery-item-overlay">
                            <span class="ion-eye"></span>
                          </div>
                          <img src={gallery6thumb} alt="" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
       
            <Promo/>
          </aside> */}
          {/* <!-- END: Sidebar --> */}
        {/* </div> */}
      </div>
    </div>
  );
}

export default LastPosts;
