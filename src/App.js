import Home from "./Home";
import BlocArticle from "./BlogArticle/BlocArticle";  
import Article from "./BlogArticle/Article"; 
import Preco from "./BlogArticle/Preco"; 

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
<Route path="/PC-Steam/:id/:title" element={<Products />}/>
<Route path="/Xbox/:id/:title" element={<ProductXBOX />}/>
<Route path="/Playstation/:id/:title" element={<ProductPS />}/>

<Route path="/news/:id/:news_id" element={<Article />} />

<Route path="/précommandes/:id/:title" element={<Preco />}/>

</Routes>


    </div>
  );
}

export default App;