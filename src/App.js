import Home from "./Home";
import Admin from "./Components/Admin/Admin";
import ArticlePage from "./Components/Admin/ArticlePage";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/article/:doc_id" element={<ArticlePage />} />

        {/* Routes existantes (décommentez si besoin) */}
        {/* <Route path="/Login" element={<Login />}/> */}
        {/* <Route path="/Register" element={<Register />}/> */}
        {/* <Route path="/PC/:id/:title" element={<Products />}/> */}
        {/* <Route path="/Ubisoft/:id/:title" element={<Ubisoft />}/> */}
        {/* <Route path="/Xbox/:id/:title" element={<ProductXBOX />}/> */}
        {/* <Route path="/Playstation/:id/:title" element={<ProductPS />}/> */}
        {/* <Route path="/PC_Rockstar/:id/:title" element={<ProductRockstar />}/> */}
        {/* <Route path="/Battlenet/:id/:support" element={<ProductBlizzard />}/> */}
        {/* <Route path="/actualités" element={<BlocArticle />} /> */}
        {/* <Route path="/Populaires" element={<Populaires />} /> */}
        {/* <Route path="/Sorties" element={<Sorties />} /> */}
        {/* <Route path="/PrecoFull" element={<PrecoFull />} /> */}
        {/* <Route path="/précommandes/:id/:title" element={<Preco />}/> */}
      </Routes>
    </div>
  );
}

export default App;