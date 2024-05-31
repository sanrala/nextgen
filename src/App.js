import Home from "./Home";
import BlocArticle from "./BlogArticle/BlocArticle";  
import Article from "./BlogArticle/Article"; 
import PrecoFull from "./BlogArticle/PrecoFull"; 
import Populaires from "./BlogArticle/PopularArticle"; 
import Preco from "./BlogArticle/Preco"; 
import Sorties from "./BlogArticle/SortiesArticle"; 
import ProductRockstar from "./Products/ProductRockstar";
import ProductBlizzard from "./Products/ProductBlizzard";
import Products from "./Products/Product";
import Login from "./Components/Login/Login";
import Register from "./Components/Login/Register";
import ProductPS from "./Products/ProductPS";
import ProductXBOX from "./Products/ProductXBOX";
import {Routes, Route} from "react-router-dom"

function App() {
  return (
    <div className="App">
    
{/* <Home/> */}

<Routes>

<Route path="/" element={<Home />}/>

<Route path="/Login" element={<Login />}/>
<Route path="/Register" element={<Register />}/>
<Route path="/PC/:id/:title" element={<Products />}/>
<Route path="/Xbox/:id/:title" element={<ProductXBOX />}/>
<Route path="/Playstation/:id/:title" element={<ProductPS />}/>
<Route path="/PC_Rockstar/:id/:title" element={<ProductRockstar />}/>
<Route path="/Battlenet/:id/:support" element={<ProductBlizzard />}/>
<Route path="/news/:id/:news_id" element={<Article />} />
<Route path="/actualités" element={<BlocArticle />} />
<Route path="/Populaires" element={<Populaires />} />
<Route path="/Sorties" element={<Sorties />} />
<Route path="/PrecoFull" element={<PrecoFull />} />
<Route path="/précommandes/:id/:title" element={<Preco />}/>

</Routes>


    </div>
  );
}

export default App;
