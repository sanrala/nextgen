import React, { useState, useEffect } from "react";
import gameData from "./../../games.json";
import {Link, useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./../../Firebase";
import { Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectUser } from "./../../features/userSlice";

function LastPosts() {
  const user = useSelector(selectUser);
  const [comments, setComments] = useState([]);
  const [item, setItem] = useState(null);

  const { id, title } = useParams();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      orderBy("createdAt", "desc"),
      limit(2)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsArray = [];
      querySnapshot.forEach((doc) => {
        commentsArray.push({ ...doc.data(), id: doc.id });
      });
      setComments(commentsArray);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    // Recherchez l'élément correspondant dans le fichier JSON
    const selectedItem = gameData.find((item) => item.id === parseInt(id));

    // Mettre à jour l'état avec les données de l'élément sélectionné
    setItem(selectedItem);
  }, [id]);

  return (
    <div class="row vertical-gap">
      <div class="col-lg-12">
        <h3 class="nk-decorated-h-2">
          <span>
            <span class="text-main-1">Derniers</span> avis
          </span>
        </h3>
        <div class="nk-gap"></div>
        <div class="nk-blog-grid">
          <div class="row">
            {comments.map((comment) => (
              <div class="col-md-6" key={comment.id}>
                <div class="nk-blog-post">
                  <div class="nk-gap"></div>
                  <div className="nk-blog-post">
                    {gameData.map((item) => (
                      <>
                        {item.id == comment.gameId ? (
                          <div key={item.id}>
                            <Link
                    to={`/PC/${item.id}/${item.news_id}/`}
                    className="nk-post-img"
                  >
                              <img src={item.imageUrl} alt="Image du jeu" className="img-fluid" />
                            </Link>
                          </div>
                        ) : (
                          <div className="div"></div>
                        )}
                      </>
                    ))}
                  </div>
                  <h2 class="nk-post-title h4">
                    <a href="#">{comment.title}</a>
                  </h2>
                  <div class="nk-post-by">
                
                    par <a href="#">{comment.userName}</a>{" "}
                    {comment.createdAt
                      ? `le ${new Date(
                          comment.createdAt.seconds * 1000
                        ).toLocaleDateString("fr-FR")}`
                      : ""}
                  </div>
                  <div class="nk-gap"></div>
                  <div class="nk-post-text">
                    <p>{comment.message}</p>
                  </div>

                  <div class="nk-gap"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LastPosts;
