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
import Aboutus from "./Pages/Aboutus/Aboutus";
import Wishlist from "./Pages/Wishlist/Wishlist";
import AddToCart from "./Pages/AddToCart/AddToCart";
import BlogDetails from "./Pages/BlogDetails/BlogDetails";
import FloatingIcons from "./Components/FloatingIcons/FloatingIcons";
import FloatingSupport from "./Components/FloatingSupport/FloatingSupport";
import FloatingForm from "./Components/FloatingForm/FloatingForm";
import Shop from "./Pages/Shop/Shop";
import SignUp from "./Components/SignUp/SignUp";
import Login from "./Components/Login/Login";
import RefundPolicy from "./Components/RefundPolicy/RefundPolicy";
import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy";
import TermAndCondition from "./Components/TermAndCondition/TermAndCondition";
import BookDetails from "./Components/BookDetails/BookDetails";
import Profile from "./Pages/Profile/Profile";

import { AuthProvider } from "./context/AuthContext";

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
    <AuthProvider>
      <BrowserRouter>
        <Topbar />

        <Navbar />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* About */}
        <Route path="/about" element={<Aboutus />} />

        {/* Shop */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:slug" element={<BookDetails />} />

        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/blogdetails" element={<BlogDetails />} />

        {/* FAQ */}
        <Route path="/faq" element={<Faq />} />

        {/* Contact */}
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/contactus" element={<ContactUs />} />

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

    
        {/* Auth: Signup & Login */}
        <Route
          path="/signup"
          element={<SignUp/>}
        />

        <Route
          path="/login"
          element={<Login/>}
        />

        <Route
          path="/profile"
          element={<Profile/>}
        />

        <Route
          path="/refund-policy"
          element={<RefundPolicy/>}
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy/>}
        />

        <Route
          path="/terms-and-conditions"
          element={<TermAndCondition/>}
        />

        <Route
          path="/book-details/:slug"
          element={<BookDetails/>}
        />
        <Route
          path="/book-details"
          element={<BookDetails/>}
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
    </AuthProvider>
  );
};

export default App;