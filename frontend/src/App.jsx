import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Component/Navbar/Navbar";
import Topbar from "./Component/Topbar/Topbar";
import Footer from "./Component/Footer/Footer";
 
const App = () => {
  return (
    <BrowserRouter>
      <Topbar />
      <Navbar />

      <Routes>
       


      </Routes>
        <Footer />

    </BrowserRouter>
  );
};

export default App;