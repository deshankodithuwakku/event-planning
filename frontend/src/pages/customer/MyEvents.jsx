import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { 
  FaCalendarAlt, 
  FaCreditCard, 
  FaWallet, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUndoAlt,
  FaArrowLeft
} from 'react-icons/fa';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Check if customer is logged in
    const customerData = localStorage.getItem('customerData');
    if (!customerData) {
      navigate('/customer/login');
      return;
    }

    const fetchCustomerEvents = async () => {
      try {
        const customer = JSON.parse(customerData);
        const response = await axios.get(`http://localhost:5555/api/customers/${customer.C_ID}/events`);
        setEvents(response.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        enqueueSnackbar('Failed to load your events', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerEvents();
  }, [navigate, enqueueSnackbar]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get payment status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'refunded':
        return <FaUndoAlt className="text-blue-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  // Get payment method icon
  const getPaymentTypeIcon = (type) => {
    if (type === 'Card') {
      return <FaCreditCard className="text-blue-500" />;
    } else if (type === 'Portal') {
      return <FaWallet className="text-green-500" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link 
          to="/customer/profile" 
          className="inline-flex items-center text-sky-600 hover:text-sky-800 mb-8 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-sky-800 flex items-center">
              <FaCalendarAlt className="mr-4 text-sky-600" /> My Events
            </h1>
            <p className="mt-2 text-gray-600">View your booked events, packages, and payment details</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading your events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">You haven't booked any events yet.</p>
              <Link 
                to="/events" 
                className="mt-4 inline-block px-6 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
              >
                Browse Available Events
              </Link>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-8">
                {events.map((item) => (
                  <div 
                    key={item.payment._id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-sky-800">{item.event.E_name}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.event.status === 'active' ? 'bg-green-100 text-green-800' : 
                          item.event.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.event.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Event ID: {item.event.E_ID} | {formatDate(item.event.date)} | {item.event.location}
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Package Details</h3>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Package ID:</span>
                              <span className="font-medium">{item.package.Pg_ID}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-bold text-sky-700">${item.package.Pg_price}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Details</h3>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Payment ID:</span>
                              <span className="font-medium">{item.payment.P_ID}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Date:</span>
                              <span>{formatDate(item.payment.date)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Method:</span>
                              <span className="flex items-center">
                                {getPaymentTypeIcon(item.payment.paymentType)}
                                <span className="ml-1">{item.payment.paymentType}</span>
                              </span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-bold text-green-600">${item.payment.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className="flex items-center">
                                {getStatusIcon(item.payment.status)}
                                <span className="ml-1 capitalize">{item.payment.status}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment-specific details */}
                      {item.payment.reference && (
                        <div className="mt-4 bg-blue-50 p-3 rounded-md">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Reference Number:</span> {item.payment.reference}
                          </p>
                        </div>
                      )}
                      
                      {item.payment.cardDetails && (
                        <div className="mt-4 bg-blue-50 p-3 rounded-md">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Card:</span> {item.payment.cardDetails.cardNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEvents;
