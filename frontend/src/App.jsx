import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wishlist from "./Component/Wishlist/Wishlist";
import CartPage from "./Component/CartPage/CartPage";

const App = () => {
  return (
    <BrowserRouter>
    

      <Routes>
       <Route path="/wishlist" element={<Wishlist/>}/>
       <Route path="/cart" element={<CartPage />}/>



      </Routes>
    </BrowserRouter>
  );
};

export default App;