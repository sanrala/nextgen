import React from 'react'
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../../features/userSlice";
import { auth, googleProvider } from './../../Firebase';
function Social() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
  
    const handleSignOut = () => {
      console.log('Déconnexion en cours...');
      auth.signOut()
        .then(() => {
          console.log('Déconnexion réussie');
          dispatch(logout());
        })
        .catch((error) => {
          console.error('Erreur lors de la déconnexion:', error);
        });
    };
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
        // Si l'utilisateur est connecté, affichez un bouton de déconnexion
        <button onClick={handleSignOut}>
          <span className="fa fa-sign-out"></span> Déconnexion
        </button>
     
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