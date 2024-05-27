import React from 'react';
import styled from 'styled-components';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "./../../features/userSlice";
import { auth, googleProvider } from './../../Firebase';
// import "../../css/main.css"
const Ul = styled.ul`
list-style: none;
display: none;
flex-flow: row nowrap;

li {
  padding: 18px 10px;
}

@media (max-width: 1279px) {
  flex-flow: column nowrap;
  align-items: center;
  backdrop-filter: blur(60px) saturate(100%);
  -webkit-backdrop-filter: blur(60px) saturate(100%);
  border-radius: 10px;

  border-left: 1px solid #666;
  position: fixed;
  transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
  top: 0;
  right: 0;

  height: 50vh;
  width: 250px;
  padding-top: 3.5rem;
  transition: transform 0.3s ease-in-out;
display: flex;
  li {
    color: white;
  }
   a,
 a:focus {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3px;
  font-family: #37373f;
  font-size: 16px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  transition: 0.3s;
  position: relative;
  text-decoration: none;
}


 a:hover:before,
 li:hover>a:before,
.active:before {
  visibility: visible;
  width: 100%;

}
 a:hover,
 .active,
 .active:focus,
li:hover>a {
  color: #e74c3c;
}

}
`;



const RightNav = ({ open }) => {

  const [modalShow, setModalShow] = React.useState(false);
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  return (
    <div className='burgerNav' >
    <Ul  open={open}>

      <div className="div">
    <li>
                <Link
                  to={{
                    pathname: `/actualités/`,
                  }}
                >
                  Actualités
                </Link>
              </li>
              <li>
              <Link
                  to={{
                    pathname: `/Sorties/`,
                  }}
                >
                Nouveautés
              </Link>
              </li>
              <li>
                <Link
                  to={{
                    pathname: `/Populaires/`,
                  }}
                >
                  Populaires
                </Link>
              </li>
              <li>
              <Link
                  to={{
                    pathname: `/PrecoFull/`,
                  }}>Précommandes</Link>
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
              </div>
    </Ul>
    </div>
  )
}

export default RightNav