import React from 'react'

function Social() {
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
                                <a href="#" data-toggle="modal" data-target="#modalLogin">
                                    <span class="fa fa-user"></span>
                                </a>
                            </li>


                            {/* <li>
                                <span class="nk-cart-toggle">
                                    <span class="fa fa-shopping-cart"></span>
                                    <span class="nk-badge">27</span>
                                </span>
                                <div class="nk-cart-dropdown">

                                    <div class="nk-widget-post">
                                        <a href="store-product.html" class="nk-post-image">
                                            <img src="assets/images/product-5-xs.jpg" alt="In all revolutions of" />
                                        </a>
                                        <h3 class="nk-post-title">
                                            <a href="#" class="nk-cart-remove-item"><span class="ion-android-close"></span></a>
                                            <a href="store-product.html">In all revolutions of</a>
                                        </h3>
                                        <div class="nk-gap-1"></div>
                                        <div class="nk-product-price">€ 23.00</div>
                                    </div>

                                    <div class="nk-widget-post">
                                        <a href="store-product.html" class="nk-post-image">
                                            <img src="assets/images/product-7-xs.jpg" alt="With what mingled joy" />
                                        </a>
                                        <h3 class="nk-post-title">
                                            <a href="#" class="nk-cart-remove-item"><span class="ion-android-close"></span></a>
                                            <a href="store-product.html">With what mingled joy</a>
                                        </h3>
                                        <div class="nk-gap-1"></div>
                                        <div class="nk-product-price">€ 14.00</div>
                                    </div>

                                    <div class="nk-gap-2"></div>
                                    <div class="text-center">
                                        <a href="store-checkout.html" class="nk-btn nk-btn-rounded nk-btn-color-main-1 nk-btn-hover-color-white">Proceed to Checkout</a>
                                    </div>
                                </div>
                            </li> */}

                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Social