import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Blog from "./Pages/Blog/Blog";
import BlogDetails from "./Pages/BlogDetails/BlogDetails";
import ContactUs from "./Pages/ContactUs/ContactUs";
import Faq from "./Pages/Faq/Faq";

const App = () => {
  return (
    <BrowserRouter>
    

      <Routes>
       <Route path="/blog" element={<Blog/>}/>
<Route path="/blogdetails" element={<BlogDetails/>}/>
<Route path="/contactus" element={<ContactUs/>}/>
<Route path="/faq" element={<Faq/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;