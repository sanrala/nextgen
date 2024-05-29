import React, {useState, useEffect} from 'react'
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../../features/userSlice";
import { auth, googleProvider } from './../../Firebase';
import { Avatar } from "@mui/material";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import gamesData from "../../games.json"

function Social() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    // menu deroulant
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    // fin menu deroulant
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


// État de recherche
const [searchOpen, setSearchOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

// Charger les données de jeux depuis game.json
useEffect(() => {
    // Ici, vous pouvez effectuer une requête fetch si les données viennent d'une API
    // mais dans ce cas, nous les importons directement
}, []);
const handleSearchToggle = () => {
  setSearchOpen(!searchOpen);
};
const handleSearchChange = (event) => {
  const query = event.target.value;
  setSearchQuery(query);

  if (query.length > 0) {
      const results = gamesData.filter(game => game.title.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(results);
  } else {
      setSearchResults([]);
  }
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
                                <a href="#" onClick={handleSearchToggle}>
                                    <span className="fa fa-search"></span>
                                </a>
                                <div className="search-container">
                                    <input 
                                        type="text"
                                        className={searchOpen ? "show" : ""}
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="Rechercher des jeux..."
                                    />
                                    {searchOpen && (
                                      <div className="search-results">
                                        {searchResults.map((result, index) => (
                                            <div key={index} className="search-result-item">
                                              <Link className='resultSearch'  key={result.id}
                      {...result}
                      to={{
                        pathname: `/PC/${result.id}/${result.title}`,
                        state: { itemData: result }, // Passer les données de l'élément à la page BlocArticle
                      }}> {result.title}</Link> 
                                            </div>
                                        ))}
                                      </div>
                                    )}
                                </div>
                            </li>
                          
                          


                            <li>
                            {user ? (
        <>
          <Avatar 
            src={userN.photoURL} 
            onClick={handleMenuOpen}
            style={{ cursor: 'pointer' }} 
          />
          {userN.displayName} 
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {  handleMenuClose(); }}>
            <Link to="/profile">   <span className="fa fa-user"></span> Profil </Link>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Link to="/settings">
                <span className="fa fa-cog"></span> Paramètres
              </Link>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Link onClick={() => { handleSignOut()}}>
              <span className="fa fa-sign-out"></span> Déconnexion
              
              </Link>
            </MenuItem>
          </Menu>
        </>
      ) : (
        // Si l'utilisateur n'est pas connecté, affichez un lien de connexion
        <Link to="/Login">
          <span className="fa fa-user"></span>
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