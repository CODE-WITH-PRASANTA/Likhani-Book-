import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Mainlayout from './Layout/Mainlayout/Mainlayout';
import Dashboard from './Components/Dashboard/Dashboard';
import Enquiries from './Components/Enquiries/Enquiries';
import Order from './Components/Order/Order';
import TestimonialManagement from './Components/TestimonialManagement/TestimonialManagement';
import Gallery from './Components/Gallery/Gallery';
import Categories from './Components/Categories/Categories';
import Books from './Components/Books/Books';
import Users from './Components/Users/Users';
import Reviews from './Components/Reviews/Reviews';
import Coupons from './Components/Coupons/Coupons';
import Supports from './Components/Supports/Supports';
import Shop from './Components/Shop/Shop';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout wraps all sub-routes */}
        <Route path="/" element={<Mainlayout />}>
          {/* Default redirect when visiting "/" */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Child routes rendered in Mainlayout's <Outlet /> */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="orders" element={<Order />} />
          <Route path="gallery" element={<Gallery/>} />
          <Route path="testimonial" element={<TestimonialManagement />} />
          <Route path="categories" element={<Categories/>} />
          <Route path="books" element={<Books/>} />
          <Route path="users" element={<Users/>} />
          <Route path="reviews" element={<Reviews/>} />
          <Route path="coupons" element={<Coupons/>} />
          <Route path="supports" element={<Supports/>} />
          <Route path="shop" element={<Shop/>} />

        
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;