import Header from "./../Components/Header/Header";
import { useParams, Link } from "react-router-dom";
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

  const { news_id, id } = useParams();
  const article = gameData.find(news => news.id === parseInt(id));

  if (!article) {
    return <div>Article non trouvé</div>;
  }

  return (
    <div>
      <Header />

      <div className="container">
        <ul className="nk-breadcrumbs">
          <li><Link to="/">Accueil</Link></li>
          <li><span className="fa fa-angle-right"></span></li>
          <li><Link to="/actualite">Actualité</Link></li>
          <li><span className="fa fa-angle-right"></span></li>

          <li>
            {article.title}
          </li>
        </ul>
      </div>

      <div className="container">
        <div className="row vertical-gap">
          <div>

            {article.news && article.news.map((item, index) => (
              item.news_id === news_id && (

                <div key={index} className="nk-blog-post nk-blog-post-single">

                  <div className="nk-post-text mt-0">

                    <img src={article.imageUrl} alt={article.title} className="img-fluid"/>

                    <p>Sortie : {formatDate(article.dateSortie)}</p>

                    <h4>{item.title}</h4>
                    <p>{item.new}</p>

                    <img src={item.imageUrl} alt={item.title} className="img-fluid" />

                    {/* 🔥 FIX LINK */}
                    {item.LinkUrl && (
                      <a href={item.LinkUrl} className="know">
                        {item.Link}
                      </a>
                    )}

                    {/* VIDEO */}
                    {item.video && (
                      <div className="video-container">
                        <iframe
                          title="YouTube Video"
                          src={`https://www.youtube.com/embed/${item.video}`}
                          frameBorder="0"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* SIMILAIRES */}
                    <h3>Jeux Similaires</h3>

                    {gameData.map((i, idx) => (
                      article.genre === i.genre && (
                        <div key={idx}>
                          <Link to={`/PC/${i.id}/${i.title}`}>
                            <img src={i.imageUrl} alt={i.title} />
                          </Link>

                          <h4>
                            <Link to={`/PC/${i.id}/${i.title}`}>
                              {i.title}
                            </Link>
                            - {i.price}
                          </h4>
                        </div>
                      )
                    ))}

                  </div>
                </div>
              )
            ))}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BlocArticle;