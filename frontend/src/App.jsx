import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Aboutus from "./Pages/Aboutus/Aboutus";
// 1. यहाँ Shopdefault पेज को इम्पोर्ट करें:
import Shopdefault from "./Pages/Shopdefault/Shopdefault"; // (पाथ अपने फोल्डर के अनुसार चेक कर लें)
import Shopdeatils from "./Pages/Shopdeatils/Shopdeatils";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Aboutus />} />
        <Route path="/aboutus" element={<Aboutus />} />
        
       
        <Route path="/shopdefault" element={<Shopdefault />} />
        <Route path="/shopdetails" element={<Shopdeatils/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;