
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Mainlayout from "./Layout/Mainlayout/Mainlayout";

import Dashboard from "./Components/Dashboard/Dashboard";
import Enquiries from "./Components/Enquiries/Enquiries";
import Order from "./Components/Order/Order";
import TestimonialManagement from "./Components/TestimonialManagement/TestimonialManagement";
import Gallery from "./Components/Gallery/Gallery";
import Categories from "./Components/Categories/Categories";
import Books from "./Components/Books/Books";
import Users from "./Components/Users/Users";
import Reviews from "./Components/Reviews/Reviews";
import Coupons from "./Components/Coupons/Coupons";
import Supports from "./Components/Supports/Supports";
import Shop from "./Components/Shop/Shop";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import BlogPosting from "./Components/BlogPosting/BlogPosting";
import Login from "./Components/Login/Login";
import MyProfile from "./Components/MyProfile/MyProfile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin panel layout */}
        <Route path="/" element={<Mainlayout />}>
          {/* Default page */}
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Book management */}
          <Route path="books" element={<Books />} />
          <Route path="categories" element={<Categories />} />
          <Route path="shop" element={<Shop />} />

          {/* Orders and customers */}
          <Route path="orders" element={<Order />} />
          <Route path="users" element={<Users />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="supports" element={<Supports />} />

          {/* Content management */}
          <Route path="gallery" element={<Gallery />} />
          <Route
            path="testimonial"
            element={<TestimonialManagement />}
          />
          <Route path="reviews" element={<Reviews />} />
          <Route path="coupons" element={<Coupons />} />

          {/* Blog management */}
          <Route
            path="blogs/management"
            element={<BlogManagement />}
          />
          <Route path="blogs/create" element={<BlogPosting />} />

          {/* Admin profile */}
          <Route
            path="my-profile"
            element={<MyProfile />}
          />

          {/* Backward compatibility for the old profile URL */}
          <Route
            path="profile"
            element={<Navigate to="/my-profile" replace />}
          />

          {/* Account settings / login */}
          <Route path="settings" element={<Navigate to="/my-profile" replace />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Redirect unknown URLs */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
