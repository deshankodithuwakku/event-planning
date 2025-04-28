// Import necessary dependencies and components
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerProfileEdit from './pages/customer/CustomerProfileEdit';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventCreate from './pages/admin/EventCreate';
import EventView from './pages/admin/EventView';
import EventEdit from './pages/admin/EventEdit';
import PackageCreate from './pages/admin/PackageCreate';
import PaymentsList from './pages/admin/PaymentsList';
import UsersList from './pages/admin/UsersList';
// Import customer pages
import EventsList from './pages/customer/EventsList';
import EventDetails from './pages/customer/EventDetails';
// Import payment pages - corrected paths
import PaymentPage from './pages/customer/PaymentPage';
import PaymentSuccess from './pages/customer/PaymentSuccess';
import Feedback from './pages/customer/Feedback';
import FeedbackViews from './pages/customer/FeedbackViews';
import FeedbackManage from './pages/customer/FeedbackManage';
import EditFeedback from './pages/customer/EditFeedback';
import About from './pages/About';
import Contact from './pages/Contact';

/**
 * Main App Component
 * Handles routing and layout structure for the entire application
 * Includes both customer and admin routes
 */
const App = () => {
  return (
    // Main container with flex layout and minimum height
    <div className="flex flex-col min-h-screen">
      {/* Header component visible on all pages */}
      <Header />
      
      {/* Main content area that grows to fill available space */}
      <main className="flex-grow">
        {/* Router configuration for all application routes */}
        <Routes>
          {/* Public routes */}
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          
          {/* Customer authentication routes */}
          <Route path='/customer/login' element={<CustomerLogin />} />
          <Route path='/customer/register' element={<CustomerRegister />} />
          <Route path='/customer/profile' element={<CustomerProfile />} />
          <Route path='/customer/profile/edit' element={<CustomerProfileEdit />} />
          
          {/* Admin authentication routes */}
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          
          {/* Admin event management routes */}
          <Route path='/admin/events/create' element={<EventCreate />} />
          <Route path='/admin/events/:eventId' element={<EventView />} />
          <Route path='/admin/events/edit/:eventId' element={<EventEdit />} />
          <Route path='/admin/events/:eventId/packages/create' element={<PackageCreate />} />
          
          {/* Admin management routes */}
          <Route path='/admin/payments' element={<PaymentsList />} />
          <Route path='/admin/users' element={<UsersList />} />
          
          {/* Customer event viewing routes */}
          <Route path='/events' element={<EventsList />} />
          <Route path='/events/:eventId' element={<EventDetails />} />
          
          {/* Payment processing routes */}
          <Route path='/payment' element={<PaymentPage />} />
          <Route path='/payment/success' element={<PaymentSuccess />} />
          
          {/* Feedback management routes */}
          <Route path='/feedback' element={<Feedback />} />
          <Route path='/feedbackviews' element={<FeedbackViews />} />
          <Route path='/customer/feedback-manage' element={<FeedbackManage />} />
          <Route path='/customer/feedback/edit/:feedbackId' element={<EditFeedback />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
