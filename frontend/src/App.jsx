import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Topbar from "./Component/Topbar/Topbar";
import Navbar from "./Component/Navbar/Navbar";
import Footer from "./Component/Footer/Footer";

import CartPage from "./Component/CartPage/CartPage";
import ContactUs from "./Pages/ContactUs/ContactUs";
import Faq from "./Pages/Faq/Faq";
import Blog from "./Pages/Blog/Blog";
import Shopdeatils from "./Pages/Shopdeatils/Shopdeatils";
import Aboutus from "./Pages/Aboutus/Aboutus";
import Wishlist from "./Pages/Wishlist/Wishlist";
import AddToCart from "./Pages/AddToCart/AddToCart";

const SimplePage = ({ title }) => {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px",
      }}
    >
      <h1>{title}</h1>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Topbar />

      <Navbar />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<SimplePage title="Home Page" />}
        />

        {/* About */}
        <Route
          path="/about"
          element={<Aboutus/>}
        />

        {/* Shop */}
        <Route
          path="/shop"
          element={<Shopdeatils />}
        />

        {/* Blog */}
        <Route
          path="/blog"
          element={<Blog />}
        />

        {/* FAQ */}
        <Route
          path="/faq"
          element={<Faq/>}
        />

        {/* Contact */}
        <Route
          path="/contact"
          element={<ContactUs />}
        />

        {/* Wishlist */}
        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={<AddToCart />}
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={<SimplePage title="Sign Up Page" />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<SimplePage title="404 - Page Not Found" />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;