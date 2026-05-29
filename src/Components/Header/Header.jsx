import React from 'react'
// import Social from '../Social/Social'
import Navbar from './../Navbar/Navbar'

function Header() {
  return (
    <div>
        
{/* <!--
    Additional Classes:
        .nk-header-opaque
--> */}
<header className="nk-header" style={{ position: 'relative', background: 'transparent' }}>
    
    
{/* <!-- START: Top Contacts --> */}
{/* <Social/> */}
{/* <!-- END: Top Contacts -->

    

    <!--
        START: Navbar

    --> */}
<Navbar/>
    {/* <!-- END: Navbar --> */}

</header>

    
    
        {/* <!--
    START: Navbar Mobile


--> */}
    </div>
  )
}

export default Header