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
                    <h3 class="nk-feature-title"><button>PC</button></h3>
                    <h4 class="nk-feature-title text-main-1"><button>View Games</button></h4>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="nk-feature-1">
                <div class="nk-feature-icon">
                    <img src={icongamepad} alt=""/>
                </div>
                <div class="nk-feature-cont">
                    <h3 class="nk-feature-title"><button>PS5</button></h3>
                    <h4 class="nk-feature-title text-main-1"><button>View Games</button></h4>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="nk-feature-1">
                <div class="nk-feature-icon">
                    <img src={icongamepad2} alt=""/>
                </div>
                <div class="nk-feature-cont">
                    <h3 class="nk-feature-title"><button>Xbox Series</button></h3>
                    <h4 class="nk-feature-title text-main-1"><button>View Games</button></h4>
                </div>
            </div>
        </div>
    </div>
    {/* <!-- END: Categories --> */}
    </div>
  )
}

export default StartCatego