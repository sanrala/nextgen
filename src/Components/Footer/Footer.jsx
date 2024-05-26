import React from 'react'
import logo from "./../../assets/images/logoGames/logo.png";
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
			
				<li><a href="">News</a></li>
				<li><a href="">Tendances</a></li>
				<li><a href="">Précommandes</a></li>
				<li><a href="">Prochaines Sorties</a></li>
                <li><a href="">Nous Contacter</a></li>
			</ul> */}
			<div class="footer-social d-flex justify-content-center">
				<a href="#"><i class="fa fa-instagram"></i></a>
				<a href="#"><i class="fa fa-facebook"></i></a>
				<a href="#"><i class="fa fa-twitter"></i></a>

			</div>
            <a href="#" class="footer-logo img-fluid d-flex">
				{/* <img className='logoFoot' src={logo} alt=""/> */}
                <img  src={instantgaming} alt=""/>
			</a>
			<div class="copyright"><a href="">NextGen</a> 2024 @ All rights reserved</div>
		</div>
	</footer>
    </div>
  )
}

export default Footer