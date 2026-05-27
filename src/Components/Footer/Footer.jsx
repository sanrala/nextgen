import React from 'react'
import { Link } from "react-router-dom";
// import logo from "./../../assets/images/logoGames/logo.png";
import instantgaming from "./../../assets/images/logoGames/instantgaming.png";
import "./Footer.css";
function Footer() {
  return (
    <div>
       <footer class="footer-section">
		<div class="container">
			<div class="footer-left-pic">
				<img src="https://technext.github.io/endgame/img/footer-left-pic.png" alt=""/>
			</div>
			<div class="footer-right-pic">
				<img src="https://technext.github.io/endgame/img/footer-right-pic.png" alt=""/>
			</div>
		
			{/* <ul class="main-menu footer-menu">
			
				<li><Link to="">News</Link></li>
				<li><Link to="">Tendances</Link></li>
				<li><Link to="">Précommandes</Link></li>
				<li><Link to="">Prochaines Sorties</Link></li>
                <li><Link to="">Nous Contacter</Link></li>
			</ul> */}
			<div class="footer-social d-flex justify-content-center">
				<Link to="/..."><i class="fa fa-instagram"></i></Link>
				<Link to="/..."><i class="fa fa-facebook"></i></Link>
				<Link to="/..."><i class="fa fa-twitter"></i></Link>

			</div>
            <Link to="#" class="footer-logo img-fluid d-flex">
				{/* <img className='logoFoot' src={logo} alt=""/> */}
                <img  src={instantgaming} alt=""/>
			</Link>
			<div class="copyright"><Link to="">NextGen</Link> 2024 @ All rights reserved</div>
		</div>
	</footer>
    </div>
  )
}

export default Footer