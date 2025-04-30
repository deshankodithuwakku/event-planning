// Import necessary dependencies and components
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Header from './components/Header';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerProfileEdit from './pages/customer/CustomerProfileEdit';
import MyEvents from './pages/customer/MyEvents';
import MyPayments from './pages/customer/MyPayments';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventCreate from './pages/admin/EventCreate';
import EventView from './pages/admin/EventView';
import EventEdit from './pages/admin/EventEdit';
import PackageCreate from './pages/admin/PackageCreate';
import PaymentsList from './pages/admin/PaymentsList';
import UsersList from './pages/admin/UsersList';
import EventsList from './pages/customer/EventsList';
import EventDetails from './pages/customer/EventDetails';
import PaymentPage from './pages/customer/PaymentPage';
import PaymentSuccess from './pages/customer/PaymentSuccess';
import Feedback from './pages/customer/Feedback';
import FeedbackViews from './pages/customer/FeedbackViews';
import FeedbackManage from './pages/customer/FeedbackManage';
import EditFeedback from './pages/customer/EditFeedback';
import About from './pages/About';
import Contact from './pages/Contact';
import UnifiedLogin from './pages/UnifiedLogin';

/**
 * Main App Component
 * Handles routing and layout structure for the entire application
 * Includes both customer and admin routes
 */
const App = () => {
  return (
    <AuthProvider>
      {/* Main container with flex layout and minimum height */}
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
            <Route path='/login' element={<UnifiedLogin />} />
            <Route path='/customer/register' element={<CustomerRegister />} />
            <Route path='/events' element={<EventsList />} />
            <Route path='/events/:eventId' element={<EventDetails />} />
            <Route path='/feedbackviews' element={<FeedbackViews />} />
            
            {/* Customer routes */}
            <Route path='/customer/login' element={<Navigate to="/login" />} />
            <Route path='/customer/profile' element={
              <ProtectedRoute requireCustomer>
                <CustomerProfile />
              </ProtectedRoute>
            } />
            <Route path='/customer/profile/edit' element={
              <ProtectedRoute requireCustomer>
                <CustomerProfileEdit />
              </ProtectedRoute>
            } />
            <Route path='/customer/my-events' element={
              <ProtectedRoute requireCustomer>
                <MyEvents />
              </ProtectedRoute>
            } />
            <Route path='/customer/payments' element={
              <ProtectedRoute requireCustomer>
                <MyPayments />
              </ProtectedRoute>
            } />
            <Route path='/payment' element={
              <ProtectedRoute requireCustomer>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path='/payment/success' element={
              <ProtectedRoute requireCustomer>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path='/feedback' element={
              <ProtectedRoute requireCustomer>
                <Feedback />
              </ProtectedRoute>
            } />
            <Route path='/customer/feedback-manage' element={
              <ProtectedRoute requireCustomer>
                <FeedbackManage />
              </ProtectedRoute>
            } />
            <Route path='/customer/feedback/edit/:feedbackId' element={
              <ProtectedRoute requireCustomer>
                <EditFeedback />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path='/admin/login' element={<Navigate to="/login" />} />
            <Route path='/admin/dashboard' element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path='/admin/events/create' element={
              <ProtectedRoute requireAdmin>
                <EventCreate />
              </ProtectedRoute>
            } />
            <Route path='/admin/events/:eventId' element={
              <ProtectedRoute requireAdmin>
                <EventView />
              </ProtectedRoute>
            } />
            <Route path='/admin/events/edit/:eventId' element={
              <ProtectedRoute requireAdmin>
                <EventEdit />
              </ProtectedRoute>
            } />
            <Route path='/admin/events/:eventId/packages/create' element={
              <ProtectedRoute requireAdmin>
                <PackageCreate />
              </ProtectedRoute>
            } />
            <Route path='/admin/payments' element={
              <ProtectedRoute requireAdmin>
                <PaymentsList />
              </ProtectedRoute>
            } />
            <Route path='/admin/users' element={
              <ProtectedRoute requireAdmin>
                <UsersList />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
