import Home from "./Home";
import BlocArticle from "./BlogArticle/BlocArticle";  
import Article from "./BlogArticle/Article"; 

import Populaires from "./BlogArticle/PopularArticle"; 
import Preco from "./BlogArticle/Preco"; 
import ProductRockstar from "./Products/ProductRockstar";
import Products from "./Products/Product";
import ProductPS from "./Products/ProductPS";
import ProductXBOX from "./Products/ProductXBOX";
import {Routes, Route} from "react-router-dom"

function App() {
  return (
    <div className="App">
    
{/* <Home/> */}

<Routes>

<Route path="/" element={<Home />}/>
<Route path="/PC/:id/:title" element={<Products />}/>
<Route path="/Xbox/:id/:title" element={<ProductXBOX />}/>
<Route path="/Playstation/:id/:title" element={<ProductPS />}/>
<Route path="/PC_Rockstar/:id/:title" element={<ProductRockstar />}/>
<Route path="/news/:id/:news_id" element={<Article />} />
<Route path="/actualités" element={<BlocArticle />} />
<Route path="/Populaires" element={<Populaires />} />
<Route path="/précommandes/:id/:title" element={<Preco />}/>

</Routes>


    </div>
  );
}

export default App;
