import React from 'react'
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../../features/userSlice";
import { auth, googleProvider } from './../../Firebase';
import { Avatar } from "@mui/material";
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

    const userN = auth.currentUser;
    if (userN !== null) {
      // The user object has basic properties such as display name, email, etc.
      const displayName = userN.displayName;
      const email = userN.email;
      const photoURL = userN.photoURL;
      const emailVerified = userN.emailVerified;
  
      // The user's ID, unique to the Firebase project. Do NOT use
      // this value to authenticate with your backend server, if
      // you have one. Use User.getToken() instead.
      const uid = userN.uid;
    }
  
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
                                 <>
     <a>{userN.displayName}</a>
        <button onClick={handleSignOut}>
          <span className="fa fa-sign-out"></span> Déconnexion
        </button>
      {/* <Avatar src={userN.photoURL} /> */}
     </>
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