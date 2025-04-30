import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaCreditCard, FaWallet, FaFilter, FaEdit, FaTrash } from 'react-icons/fa';
import EditPayment from './EditPayment';
import { getImageUrl } from '../../utils/urlHelper';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'card', 'portal'
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchPayments();
  }, [navigate, filter]);

  const fetchPayments = async () => {
    try {
      let endpoint = 'http://localhost:5555/api/payments';
      
      // Apply filter if needed
      if (filter === 'card') {
        endpoint = 'http://localhost:5555/api/payments/card';
      } else if (filter === 'portal') {
        endpoint = 'http://localhost:5555/api/payments/portal';
      }
      
      const response = await axios.get(endpoint);
      setPayments(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch payments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await axios.delete(`http://localhost:5555/api/payments/${paymentId}`);
        enqueueSnackbar('Payment record deleted successfully', { variant: 'success' });
        fetchPayments();
      } catch (error) {
        enqueueSnackbar('Failed to delete payment record', { variant: 'error' });
      }
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
      enqueueSnackbar('Payment updated successfully', { variant: 'success' });
      setIsEditModalOpen(false);
      fetchPayments();
    } catch (error) {
      enqueueSnackbar('Failed to update payment', { variant: 'error' });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get payment type icon
  const getPaymentTypeIcon = (type) => {
    if (type === 'Card') {
      return <FaCreditCard className="text-blue-500" />;
    } else if (type === 'Portal') {
      return <FaWallet className="text-green-500" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {isEditModalOpen && selectedPayment && (
        <EditPayment 
          payment={selectedPayment}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}
      
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-purple-800">Payment Transactions</h2>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="all">All Payments</option>
                <option value="card">Card Payments</option>
                <option value="portal">Portal Payments</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No payment records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Slip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.P_ID}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPaymentTypeIcon(payment.paymentType)}
                          <span className="ml-2">{payment.paymentType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-sm font-semibold bg-green-100 text-green-800 rounded-full">
                          ${payment.p_amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.p_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {payment.paymentType === 'Card' ? payment.c_description : payment.p_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.paymentType === 'Portal' && payment.bankSlipUrl && (
                          <a 
                            href={getImageUrl(payment.bankSlipUrl)}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <img 
                              src={getImageUrl(payment.bankSlipUrl)} 
                              alt="Bank slip" 
                              className="w-12 h-12 object-cover rounded border border-gray-300"
                            />
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {/* <button
                            onClick={() => handleEditClick(payment)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit />
                          </button> */}
                          <button
                            onClick={() => handleDeletePayment(payment._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
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
    </div>
  );
};

export default PaymentsList;
