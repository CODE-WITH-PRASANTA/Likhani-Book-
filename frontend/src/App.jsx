import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Aboutus from "./Pages/Aboutus/Aboutus";
// 1. यहाँ Shopdefault पेज को इम्पोर्ट करें:
import Shopdefault from "./Pages/Shopdefault/Shopdefault"; // (पाथ अपने फोल्डर के अनुसार चेक कर लें)
import Shopdeatils from "./Pages/Shopdeatils/Shopdeatils";
import Blog from "./Pages/Blog/Blog";
import BlogDetails from "./Pages/BlogDetails/BlogDetails";
import ContactUs from "./Pages/ContactUs/ContactUs";
import Faq from "./Pages/Faq/Faq";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Aboutus />} />
        <Route path="/aboutus" element={<Aboutus />} />
        
       
        <Route path="/shopdefault" element={<Shopdefault />} />
        <Route path="/shopdetails" element={<Shopdeatils/>}/>
       <Route path="/blog" element={<Blog/>}/>
<Route path="/blogdetails" element={<BlogDetails/>}/>
<Route path="/contactus" element={<ContactUs/>}/>
<Route path="/faq" element={<Faq/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;