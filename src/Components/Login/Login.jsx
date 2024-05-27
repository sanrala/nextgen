import React, { useState, useEffect } from 'react';
import './Login.css'; // Importez votre fichier CSS de style
import logo from './../../assets/images/logoGames/logo.png'; // Importez votre logo
import LoginBG from "./../../assets/images/login.jpg"
import { auth, googleProvider } from './../../Firebase';
import { getAuth,signInWithEmailAndPassword , signInWithPopup, GoogleAuthProvider, FacebookAuthProvider  } from "firebase/auth";

import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "./../../features/userSlice";
import { login, logout } from "./../../features/userSlice";
import { useNavigate  } from 'react-router-dom';
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ajoutez votre logique de validation et d'envoi du formulaire ici
    console.log('Email:', email);
    console.log('Password:', password);
  };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, googleProvider);
  //     console.log('User Info:', result.user);
  //   } catch (error) {
  //     console.error('Error signing in with Google:', error);
  //   }
  // };



  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const navigate = useNavigate ();
  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      // console.log("user is ", authUser);
      if (authUser) {
        // login
        dispatch(
          login({
            uid: authUser.uid,
            photo: authUser.photoURL,
            email: authUser.email,
            displayName: authUser.displayName,
          })
        
        );
        // console.log(authUser.displayName)
      } else {
        // logout
        dispatch(logout());
      }
    });
  }, [dispatch]);
  useEffect(() => {
    if (user) {
      navigate('/'); // Remplacez '/home' par le chemin de votre page d'accueil
    }
  }, [user, navigate]);

  const provider = new GoogleAuthProvider();
  const signIn = async (e) => {
    const provider = await new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
      }

  return (
    
    <div className="login-container">
      <div className="login-form">
      <Link
              to={{
                pathname: `/`,
                // Passer les données de l'élément à la page BlocArticle
              }} >
        <img src={logo} alt="Logo" className="logo" />
        </Link>
        <h2>Se connecter</h2>
        <div className="links">
          <Button  onClick={signIn} className='google signin-btn-google'>

            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>

          </Button>

          {/* <a href="/fr/creer-un-compte/" class="discord signin-btn-discord" data-redirect="https://www.instant-gaming.com/fr/sign-in/discord/?redirect=https%3A%2F%2Fwww.instant-gaming.com%2Ffr%2F">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0,0,256,256">
<g fill="#f9faff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" ><g transform="scale(5.33333,5.33333)"><path d="M40,12c0,0 -4.585,-3.588 -10,-4l-0.488,0.976c4.896,1.198 7.142,2.915 9.488,5.024c-4.045,-2.065 -8.039,-4 -15,-4c-6.961,0 -10.955,1.935 -15,4c2.346,-2.109 5.018,-4.015 9.488,-5.024l-0.488,-0.976c-5.681,0.537 -10,4 -10,4c0,0 -5.121,7.425 -6,22c5.162,5.953 13,6 13,6l1.639,-2.185c-2.782,-0.967 -5.924,-2.694 -8.639,-5.815c3.238,2.45 8.125,5 16,5c7.875,0 12.762,-2.55 16,-5c-2.715,3.121 -5.857,4.848 -8.639,5.815l1.639,2.185c0,0 7.838,-0.047 13,-6c-0.879,-14.575 -6,-22 -6,-22zM17.5,30c-1.933,0 -3.5,-1.791 -3.5,-4c0,-2.209 1.567,-4 3.5,-4c1.933,0 3.5,1.791 3.5,4c0,2.209 -1.567,4 -3.5,4zM30.5,30c-1.933,0 -3.5,-1.791 -3.5,-4c0,-2.209 1.567,-4 3.5,-4c1.933,0 3.5,1.791 3.5,4c0,2.209 -1.567,4 -3.5,4z"></path></g></g>
</svg>
</a> */}
    
        </div>
        <div class="login-separator">
        <div className="divider-container">
      <hr className="divider-line" />
      <span className="divider-text">OU</span>
      <hr className="divider-line" />
    </div>
        </div>
        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <input
              type="text"
              id="email"
              placeholder="Votre e-mail ou nom d'utilisateur"
              required
            />
          </div>
          <div className="form-group">

            <input
              type="password"
              id="password"
              placeholder="Votre mot de passe"
              required
            />
          </div>
          <button type="submit" className="login-btn">Se connecter</button>

        </form>
        <div className="link__s">
          <a href="#">Mot de passe oublié ?</a>
          <a href="#">Inscription</a>
        </div>
      </div>
      <div className="login-image" style={{ backgroundImage: `url(${LoginBG})` }}></div>
    </div>
  );
};

export default Login;