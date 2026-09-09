import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout Components
import Topbar from "./Component/Topbar/Topbar";
import Navbar from "./Component/Navbar/Navbar";
import Footer from "./Component/Footer/Footer";

// Page Components
import Aboutus from "./Pages/Aboutus/Aboutus";
import Shopdefault from "./Pages/Shopdefault/Shopdefault";
import Shopdeatils from "./Pages/Shopdeatils/Shopdeatils";
import Blog from "./Pages/Blog/Blog";
import BlogDetails from "./Pages/BlogDetails/BlogDetails";
import ContactUs from "./Pages/ContactUs/ContactUs";
import Faq from "./Pages/Faq/Faq";

const App = () => {
  return (
    <BrowserRouter>
      <Topbar />
      <Navbar />

      <Routes>
        <Route path="/about" element={<Aboutus />} />
        <Route path="/shopdefault" element={<Shopdefault />} />
        <Route path="/shopdetails" element={<Shopdeatils />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blogdetails" element={<BlogDetails />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;