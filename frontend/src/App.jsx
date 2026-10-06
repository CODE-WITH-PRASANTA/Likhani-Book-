import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Topbar from "./Components/Topbar/Topbar";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

import CartPage from "./Components/CartPage/CartPage";
import ContactUs from "./Pages/ContactUs/ContactUs";
import Faq from "./Pages/Faq/Faq";
import Home from "./Pages/Home/Home";
import Blog from "./Pages/Blog/Blog";
import Shopdeatils from "./Pages/Shopdeatils/Shopdeatils";
import Aboutus from "./Pages/Aboutus/Aboutus";
import Wishlist from "./Pages/Wishlist/Wishlist";
import AddToCart from "./Pages/AddToCart/AddToCart";
import BlogDetails from "./Pages/BlogDetails/BlogDetails";
import FloatingIcons from "./Components/FloatingIcons/FloatingIcons";
import FloatingSupport from "./Components/FloatingSupport/FloatingSupport";
import FloatingForm from "./Components/FloatingForm/FloatingForm";

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
       <Route path="/blog" element={<Blog/>}/>
        <Route path="/blogdetails" element={<BlogDetails/>}/>
        <Route path="/contactus" element={<ContactUs/>}/>
        <Route path="/faq" element={<Faq/>}/>
        <Route path="/"element={<Home/>}/>
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

        <Route
          path="/cart-page"
          element={<CartPage/>}
        />

        <Route
          path="/BlogDetails"
          element={<BlogDetails />}
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

           <FloatingForm/>

      <Footer />

          <FloatingIcons/>

         <FloatingSupport/>

    </BrowserRouter>
  );
};

export default App;