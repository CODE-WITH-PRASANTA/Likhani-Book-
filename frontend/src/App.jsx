import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Topbar from "./Component/Topbar/Topbar";
import Navbar from "./Component/Navbar/Navbar";
import Footer from "./Component/Footer/Footer";

import Wishlist from "./Component/Wishlist/Wishlist";
import CartPage from "./Component/CartPage/CartPage";

const App = () => {
  return (
    <BrowserRouter>
      <Topbar />

      <Navbar />

      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;