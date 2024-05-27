import React from 'react'
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "./../../features/userSlice";
import { auth, googleProvider } from './../../Firebase';
function Social() {
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    return (
        <div>
            <div class="nk-contacts-top">
                <div class="container">
                    <div class="nk-contacts-left">
                        <ul class="nk-social-links">

                            <li><a class="nk-social-steam" href="#"><i class="fa-brands fa-steam"></i></a></li>
                            <li><a class="nk-social-facebook" href="#"><span class="fab fa-facebook"></span></a></li>
                            <li><a class="nk-social-twitter" href="#" target="_blank"><span class="fab fa-twitter"></span></a></li>

                        </ul>
                    </div>
                    <div class="nk-contacts-right">
                        <ul class="nk-contacts-icons">

                            <li>
                                <a href="#" data-toggle="modal" data-target="#modalSearch">
                                    <span class="fa fa-search"></span>
                                </a>
                            </li>


                            <li>
                            {user ? (
        // Si l'utilisateur est connecté, affichez un lien de déconnexion
        <a href='' >
          <span className="fa fa-sign-out" onClick={() => auth.signOut()}></span> Déconnexion
        </a>
      ) : (
        // Si l'utilisateur n'est pas connecté, affichez un lien de connexion
        <Link
        to={{
          pathname: `/Login/`,
        }}
      >
                          <span class="fa fa-user"></span>
                      </Link>
      )}
              
                            </li>


                     

                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Social