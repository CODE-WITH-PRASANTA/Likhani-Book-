import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import BlogManagement from './Component/BlogManagement/BlogManagement';

import BlogPosting from './Component/BlogPosting/BlogPosting';
import Shop from './Component/Shop/Shop';




const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout wraps all sub-routes */}
        {/* <Route path="/" element={<Mainlayout />}> */}
          <Route path="/blogmanagement" element={<BlogManagement/>}/>
       
         <Route path="/blogposting" element={<BlogPosting/>}/> 
         <Route path="/shop" element={<Shop/>}/> 
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;