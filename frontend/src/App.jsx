import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/customer/login' element={<CustomerLogin />} />
          <Route path='/customer/register' element={<CustomerRegister />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/register' element={<AdminRegister />} />
          {/* Placeholder routes - these will need to be implemented later */}
          <Route path='/events' element={<div className="p-8">Events Page Coming Soon</div>} />
          <Route path='/events/create' element={<div className="p-8">Create Event Page Coming Soon</div>} />
          <Route path='/about' element={<div className="p-8">About Page Coming Soon</div>} />
          <Route path='/contact' element={<div className="p-8">Contact Page Coming Soon</div>} />
          <Route path='/admin/dashboard' element={<div className="p-8">Admin Dashboard Coming Soon</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
