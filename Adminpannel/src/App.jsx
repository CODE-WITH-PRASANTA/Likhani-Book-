import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Mainlayout from './Layout/Mainlayout/Mainlayout';




const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout wraps all sub-routes */}
        <Route path="/" element={<Mainlayout />}>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;