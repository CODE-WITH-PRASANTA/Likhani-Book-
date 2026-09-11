import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Mainlayout from './Layout/Mainlayout/Mainlayout';
import Dashboard from '../Dashboard/Dashboard';
import Enquiries from '../Enquiries/Enquiries';
import TestimonialManagement from '../TestimonialManagement/TestimonialManagement';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout wraps all sub-routes */}
        <Route path="/" element={<Mainlayout />}>
          {/* Default page when visiting "/" */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Sibling child routes rendered in Mainlayout's <Outlet /> */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="testimonial" element={<TestimonialManagement />} />


        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;