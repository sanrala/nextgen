import React, { useState } from 'react';
import './Login.css'; // Importez votre fichier CSS de style
import logo from './../../assets/images/logoGames/logo.png'; // Importez votre logo

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ajoutez votre logique de validation et d'envoi du formulaire ici
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="login-container">
    <div className="login-form">
      <img src={logo} alt="Logo" className="logo" />
     
      <h2>Se connecter</h2>
      
      <div class="login-separator">
<span>ou</span>
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
      <div className="links">
        <a href="#">Mot de passe oublié ?</a>
        <a href="#">Inscription</a>
      </div>
    </div>
    <div className="login-image" style={{ backgroundImage: `url('https://www.instant-gaming.com/themes/igv2/modules/register/images/wallpaper.jpg')` }}></div>
  </div>
  );
};

export default Login;