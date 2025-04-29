import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { 
  FaArrowLeft, FaCreditCard, FaIdCard, FaWallet, 
  FaCheckCircle, FaTimesCircle, FaUndoAlt, FaEye, 
  FaFileImage, FaTimes, FaSpinner, FaEdit
} from 'react-icons/fa';
import EditCustomerPayment from '../../components/payment/EditCustomerPayment';
import { getImageUrl } from '../../utils/urlHelper';

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  useEffect(() => {
    const customerData = localStorage.getItem('customerData');
    if (!customerData) {
      enqueueSnackbar('Please log in to view your payments', { variant: 'error' });
      navigate('/customer/login');
      return;
    }
    
    const customer = JSON.parse(customerData);
    fetchPayments(customer.C_ID);
  }, [navigate, enqueueSnackbar]);
  
  const fetchPayments = async (customerId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5555/api/payments/customer/${customerId}`);
      
      if (response.data && Array.isArray(response.data)) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }
    } catch (error) {
      enqueueSnackbar('Failed to load payment history', { variant: 'error' });
      
      try {
        const alternateResponse = await axios.get(`http://localhost:5555/api/payments/customer/my-payments?customerId=${customerId}`);
        
        if (alternateResponse.data && Array.isArray(alternateResponse.data)) {
          setPayments(alternateResponse.data);
        } else {
          setPayments([]);
        }
      } catch (fallbackError) {
        setPayments([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getPaymentTypeIcon = (type) => {
    if (type === 'Card') {
      return <FaCreditCard className="text-blue-500" />;
    } else if (type === 'Portal') {
      return <FaWallet className="text-green-500" />;
    }
    return null;
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> Confirmed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaUndoAlt className="mr-1" /> Refunded
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };
  
  const handleCancel = async (paymentId) => {
    if (!window.confirm('Are you sure you want to cancel this payment?')) {
      return;
    }
    
    try {
      const customerData = JSON.parse(localStorage.getItem('customerData'));
      
      await axios.patch(`http://localhost:5555/api/payments/customer/cancel/${paymentId}`, {
        customerId: customerData.C_ID
      });
      
      enqueueSnackbar('Payment cancelled successfully', { variant: 'success' });
      
      setPayments(payments.map(payment => 
        payment._id === paymentId ? { ...payment, status: 'cancelled' } : payment
      ));
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Failed to cancel payment', { variant: 'error' });
    }
  };
  
  const viewBankSlip = (payment) => {
    if (payment.paymentType === 'Portal' && payment.bankSlipUrl) {
      setSelectedSlip(getImageUrl(payment.bankSlipUrl));
      setShowModal(true);
    } else if (payment.paymentType === 'Portal' && !payment.bankSlipUrl) {
      enqueueSnackbar('No bank slip available for this payment', { variant: 'info' });
    }
  };

  const handleEditClick = (payment) => {
    setSelectedPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedPayment(null);
  };

  const handleEditSave = async (editedPayment) => {
    try {
      await axios.put(`http://localhost:5555/api/payments/${editedPayment._id}`, editedPayment);
      enqueueSnackbar('Payment details updated successfully', { variant: 'success' });
      setIsEditModalOpen(false);
      
      setPayments(payments.map(payment => 
        payment._id === editedPayment._id ? editedPayment : payment
      ));
    } catch (error) {
      enqueueSnackbar('Failed to update payment details', { variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      {isEditModalOpen && selectedPayment && (
        <EditCustomerPayment
          payment={selectedPayment}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}
      
      <div className="max-w-6xl mx-auto">
        <Link 
          to="/customer/profile" 
          className="inline-flex items-center text-sky-600 hover:text-sky-800 mb-8 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-sky-800">My Payments</h1>
            <p className="text-gray-500 mt-2">View and manage your payment history</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700 mx-auto"></div>
              <p className="mt-3 text-gray-500">Loading your payment history...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">You don't have any payment history yet.</p>
              <p className="text-sm text-gray-400 mt-2">Debug info: Check console for more information.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event/Package</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.P_ID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.p_date || payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPaymentTypeIcon(payment.paymentType)}
                          <span className="ml-2">
                            {payment.paymentType === 'Card' ? payment.c_type : 'Portal Payment'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">${payment.p_amount?.toFixed(2) || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.eventId} / {payment.packageId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEditClick(payment)}
                            className="text-sky-600 hover:text-sky-900 flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          
                          {payment.paymentType === 'Portal' && (
                            <button
                              onClick={() => viewBankSlip(payment)}
                              className="text-sky-600 hover:text-sky-900 flex items-center"
                            >
                              <FaEye className="mr-1" /> View Slip
                            </button>
                          )}
                          
                          {payment.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancel(payment._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-sky-800">Bank Slip</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg">
              <img src={selectedSlip} alt="Bank slip" className="max-h-96 mx-auto object-contain" />
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
