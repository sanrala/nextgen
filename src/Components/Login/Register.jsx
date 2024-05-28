import React, { useState } from 'react';
import './Login.css';
import logo from './../../assets/images/logoGames/logo.png';
import LoginBG from "./../../assets/images/login.jpg"
import { auth, googleProvider } from './../../Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate  } from 'react-router-dom';
import { Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate ();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des champs
    if (!name || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Validation de la complexité du mot de passe avec une regex
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, un chiffre et un symbole.");
      return;
    }

    try {
      // Création de l'utilisateur avec email et mot de passe
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Vous pouvez ici ajouter le code pour sauvegarder le nom d'utilisateur dans la base de données ou autre
      console.log("User registered successfully:", userCredential.user);
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src={logo} alt="Logo" className="logo" />
        <h2>Inscription</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">S'inscrire</button>
        </form>
        <div className="link__s">
         
          <Link       to={{
          pathname: `/Login/`,
        }}>  Retour </Link>
        </div>
      </div>
      <div className="login-image" style={{ backgroundImage: `url(${LoginBG})` }}></div>
    </div>
  );
};

export default Register;
