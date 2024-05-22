import React from 'react'
import iconmouse  from './../../assets/images/icon-mouse.png'
import icongamepad  from './../../assets/images/icon-gamepad.png'
import icongamepad2  from './../../assets/images/icon-gamepad-2.png'
function StartCatego() {
  return (
    <div>
        
        {/* <!-- START: Categories --> */}
    <div class="nk-gap-2"></div>
    <div class="row vertical-gap" >
        <div class="col-lg-4">
            <div class="nk-feature-1">
                <div class="nk-feature-icon">
                    <img src={iconmouse} alt=""/>
                </div>
                <div class="nk-feature-cont">
                    <h3 class="nk-feature-title"><a href="#">PC</a></h3>
                    <h4 class="nk-feature-title text-main-1"><a href="#">View Games</a></h4>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="nk-feature-1">
                <div class="nk-feature-icon">
                    <img src={icongamepad} alt=""/>
                </div>
                <div class="nk-feature-cont">
                    <h3 class="nk-feature-title"><a href="#">PS5</a></h3>
                    <h4 class="nk-feature-title text-main-1"><a href="#">View Games</a></h4>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="nk-feature-1">
                <div class="nk-feature-icon">
                    <img src={icongamepad2} alt=""/>
                </div>
                <div class="nk-feature-cont">
                    <h3 class="nk-feature-title"><a href="#">Xbox Series</a></h3>
                    <h4 class="nk-feature-title text-main-1"><a href="#">View Games</a></h4>
                </div>
            </div>
        </div>
    </div>
    {/* <!-- END: Categories --> */}
    </div>
  )
}

export default StartCatego