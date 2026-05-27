import React from "react";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import gameData from "../games.json";
import { Link } from "react-router-dom";

function SortiesArticle() {

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  const today = new Date();

  const sorted = gameData
    .filter((g) => new Date(g.dateSortie) <= today)
    .sort((a, b) => new Date(b.dateSortie) - new Date(a.dateSortie));

  return (
    <div>
      <Header />

      <div className="container">
        {sorted.map((v) => (
          <div key={v.id} className="nk-blog-post">
            <img src={v.imageUrl} alt={v.title} />

            <h2>
              <Link to={`/PC/${v.id}`}>{v.title}</Link>
            </h2>

            <p>{formatDate(v.dateSortie)}</p>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default SortiesArticle;