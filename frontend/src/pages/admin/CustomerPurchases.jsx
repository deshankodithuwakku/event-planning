import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaStar, FaFilePdf, FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CustomerPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [expandedCustomers, setExpandedCustomers] = useState({});

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchCustomerPurchases();
  }, [navigate]);

  const fetchCustomerPurchases = async () => {
    try {
      // Use the direct endpoint that bypasses authentication checks for development
      const response = await axios.get('http://localhost:5555/api/customer-purchases');
      
      setPurchases(response.data.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      enqueueSnackbar('Failed to fetch customer purchases. Please try again later.', { 
        variant: 'error',
        autoHideDuration: 4000 
      });
    } finally {
      setLoading(false);
    }
  };

  // Group purchases by customer ID
  const getGroupedPurchases = () => {
    const groupedData = {};
    
    purchases.forEach(purchase => {
      const customerId = purchase.customer.customerId;
      
      if (!groupedData[customerId]) {
        groupedData[customerId] = {
          customer: purchase.customer,
          purchases: []
        };
      }
      
      groupedData[customerId].purchases.push(purchase);
    });
    
    return Object.values(groupedData);
  };

  const toggleCustomerExpansion = (customerId) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalSpent = (purchases) => {
    return purchases.reduce((total, purchase) => 
      total + parseFloat(purchase.payment.amount), 0
    ).toFixed(2);
  };

  // Generate PDF report of all customer purchases
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Customer Purchases Report', 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      
      // Get grouped data
      const groupedPurchases = getGroupedPurchases();
      
      // Format data for table
      const tableData = groupedPurchases.map((groupData) => {
        const { customer, purchases } = groupData;
        const totalSpent = calculateTotalSpent(purchases);
        const eventCount = purchases.length;
        const events = purchases.map(p => p.event.name).join(", ");
        
        return [
          customer.customerId,
          customer.name,
          eventCount,
          events,
          `$${totalSpent}`,
          purchases.every(p => p.payment.status === 'paid') ? 'All Paid' : 'Mixed',
          purchases.some(p => p.feedback) ? 'Has Feedback' : 'No Feedback'
        ];
      });
      
      // Create table
      doc.autoTable({
        startY: 30,
        head: [['Customer ID', 'Customer Name', 'Total Events', 'Events', 'Total Amount', 'Status', 'Feedback']],
        body: tableData,
        headStyles: {
          fillColor: [147, 51, 234],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [249, 245, 255]
        },
        margin: { top: 30 }
      });
      
      // Add summary
      doc.text(`Total Customers: ${groupedPurchases.length}`, 14, doc.lastAutoTable.finalY + 10);
      doc.text(`Total Purchases: ${purchases.length}`, 14, doc.lastAutoTable.finalY + 18);
      
      // Save the PDF
      doc.save('customer_purchases_report.pdf');
      enqueueSnackbar('PDF generated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('PDF generation error:', error);
      enqueueSnackbar('Failed to generate PDF', { variant: 'error' });
    }
  };

  // Component for displaying feedback details in a modal
  const FeedbackModal = ({ feedback, onClose }) => {
    if (!feedback) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-800">Customer Feedback</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2">Rating:</span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={i < feedback.rating ? "text-yellow-400" : "text-gray-300"} 
                  />
                ))}
                <span className="ml-2 text-gray-700">{feedback.rating}/5</span>
              </div>
            </div>
            
            <div>
              <span className="font-semibold">Comment:</span>
              <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">{feedback.comment}</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const groupedPurchases = getGroupedPurchases();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {selectedFeedback && (
        <FeedbackModal 
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          
          {!loading && purchases.length > 0 && (
            <button
              onClick={generatePDF}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaFilePdf className="mr-2" /> Download PDF Report
            </button>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-purple-800">Customer Purchases</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">Loading customer purchases...</div>
          ) : purchases.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No customer purchases found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Events</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedPurchases.map((groupData, index) => {
                    const { customer, purchases } = groupData;
                    const customerId = customer.customerId;
                    const isExpanded = expandedCustomers[customerId];
                    const totalSpent = calculateTotalSpent(purchases);
                    
                    return (
                      <React.Fragment key={customerId}>
                        <tr 
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} cursor-pointer hover:bg-purple-50`}
                          onClick={() => toggleCustomerExpansion(customerId)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.customerId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {purchases.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                              ${totalSpent}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCustomerExpansion(customerId);
                              }}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                            >
                              {isExpanded ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr className="bg-purple-50">
                            <td colSpan="5" className="px-6 py-4">
                              <div className="rounded-lg border border-purple-100 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-purple-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-purple-700">Event Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-purple-700">Event ID</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-purple-700">Amount</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-purple-700">Status</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-purple-700">Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-purple-700">Feedback</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {purchases.map((purchase, i) => (
                                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                          {purchase.event.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                          {purchase.event.eventId}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            ${purchase.payment.amount}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${purchase.payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                            purchase.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'}`}>
                                            {purchase.payment.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                          {formatDate(purchase.payment.date)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                          {purchase.feedback ? (
                                            <div className="flex items-center">
                                              <div className="flex text-yellow-400 mr-2">
                                                {[...Array(5)].map((_, i) => (
                                                  <FaStar 
                                                    key={i} 
                                                    className={i < purchase.feedback.rating ? "text-yellow-400" : "text-gray-300"} 
                                                    size={12}
                                                  />
                                                ))}
                                              </div>
                                              <button
                                                onClick={() => setSelectedFeedback(purchase.feedback)}
                                                className="text-purple-600 hover:text-purple-800 flex items-center"
                                              >
                                                <FaEye className="mr-1" /> View
                                              </button>
                                            </div>
                                          ) : (
                                            <span className="text-gray-400">No feedback</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPurchases;
