import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerProfileEdit from './pages/customer/CustomerProfileEdit';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventCreate from './pages/admin/EventCreate';
import EventView from './pages/admin/EventView';
import EventEdit from './pages/admin/EventEdit';
import PackageCreate from './pages/admin/PackageCreate';
import PaymentsList from './pages/admin/PaymentsList';
// Import customer pages
import EventsList from './pages/customer/EventsList';
import EventDetails from './pages/customer/EventDetails';
// Import payment pages - corrected paths
import PaymentPage from './pages/customer/PaymentPage';
import PaymentSuccess from './pages/customer/PaymentSuccess';
import Feedback from './pages/customer/Feedback';
import FeedbackViews from './pages/customer/FeedbackViews';
import FeedbackManage from './pages/customer/FeedbackManage';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/customer/login' element={<CustomerLogin />} />
          <Route path='/customer/register' element={<CustomerRegister />} />
          <Route path='/customer/profile' element={<CustomerProfile />} />
          <Route path='/customer/profile/edit' element={<CustomerProfileEdit />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/register' element={<AdminRegister />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/events/create' element={<EventCreate />} />
          <Route path='/admin/events/:eventId' element={<EventView />} />
          <Route path='/admin/events/edit/:eventId' element={<EventEdit />} />
          <Route path='/admin/events/:eventId/packages/create' element={<PackageCreate />} />
          <Route path='/admin/payments' element={<PaymentsList />} />
          {/* New customer-facing routes */}
          <Route path='/events' element={<EventsList />} />
          <Route path='/events/:eventId' element={<EventDetails />} />
          {/* New payment routes */}
          <Route path='/payment' element={<PaymentPage />} />
          <Route path='/payment/success' element={<PaymentSuccess />} />
          <Route path='/feedback' element={<Feedback />} />
          <Route path='/feedbackviews' element={<FeedbackViews />} />
          <Route path='/customer/feedback-manage' element={<FeedbackManage />} />
          <Route path='/about' element={<div className="p-8">About Page Coming Soon</div>} />
          <Route path='/contact' element={<div className="p-8">Contact Page Coming Soon</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
