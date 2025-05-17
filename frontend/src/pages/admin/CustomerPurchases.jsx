import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaStar, FaFilePdf, FaEye, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { addPdfHeader, addPdfFooter, addStatsSummary } from '../../utils/pdfUtils';

const CustomerPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [expandedCustomers, setExpandedCustomers] = useState({});
  
  // Add filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    purchaseDateStart: '',
    purchaseDateEnd: '',
    minAmount: '',
    maxAmount: '',
    hasRating: 'all',
    minRating: '1'
  });

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

  // PDF Filter Modal Component
  const FilterModal = ({ onClose, onApply, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState(currentFilters);
    
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setLocalFilters(prev => ({
        ...prev,
        [name]: value
      }));
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      onApply(localFilters);
      onClose();
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-purple-800 mb-4">Filter Customer Purchases Report</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date From
                </label>
                <input
                  type="date"
                  name="purchaseDateStart"
                  value={localFilters.purchaseDateStart}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date To
                </label>
                <input
                  type="date"
                  name="purchaseDateEnd"
                  value={localFilters.purchaseDateEnd}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Amount ($)
                </label>
                <input
                  type="number"
                  name="minAmount"
                  value={localFilters.minAmount}
                  onChange={handleFilterChange}
                  placeholder="No minimum"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount ($)
                </label>
                <input
                  type="number"
                  name="maxAmount"
                  value={localFilters.maxAmount}
                  onChange={handleFilterChange}
                  placeholder="No maximum"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback Status
                </label>
                <select
                  name="hasRating"
                  value={localFilters.hasRating}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Purchases</option>
                  <option value="yes">With Feedback Only</option>
                  <option value="no">Without Feedback</option>
                </select>
              </div>
              {localFilters.hasRating === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Rating
                  </label>
                  <select
                    name="minRating"
                    value={localFilters.minRating}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="1">1+ Star</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars Only</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Apply & Generate PDF
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Filter individual purchase items based on criteria
  const filterPurchaseItems = (purchases, appliedFilters) => {
    return purchases.filter(purchase => {
      // Date filtering
      if (appliedFilters.purchaseDateStart) {
        const startDate = new Date(appliedFilters.purchaseDateStart);
        if (purchase.payment.date && new Date(purchase.payment.date) < startDate) {
          return false;
        }
      }
      
      if (appliedFilters.purchaseDateEnd) {
        const endDate = new Date(appliedFilters.purchaseDateEnd);
        endDate.setHours(23, 59, 59, 999);
        if (purchase.payment.date && new Date(purchase.payment.date) > endDate) {
          return false;
        }
      }
      
      // Amount filtering
      const amount = parseFloat(purchase.payment.amount);
      if (appliedFilters.minAmount && amount < parseFloat(appliedFilters.minAmount)) {
        return false;
      }
      if (appliedFilters.maxAmount && amount > parseFloat(appliedFilters.maxAmount)) {
        return false;
      }
      
      // Feedback filtering
      if (appliedFilters.hasRating !== 'all') {
        const hasFeedback = !!purchase.feedback;
        if (appliedFilters.hasRating === 'yes' && !hasFeedback) {
          return false;
        }
        if (appliedFilters.hasRating === 'no' && hasFeedback) {
          return false;
        }
        
        // Rating minimum check
        if (appliedFilters.hasRating === 'yes' && hasFeedback) {
          const minRating = parseInt(appliedFilters.minRating || '1');
          if (purchase.feedback.rating < minRating) {
            return false;
          }
        }
      }
      
      return true;
    });
  };

  // Generate PDF report of all customer purchases
  const generatePDF = (appliedFilters = filters) => {
    try {
      // Filter purchases using the filterPurchaseItems helper
      const filteredPurchases = filterPurchaseItems(purchases, appliedFilters);
      
      // Group filtered purchases by customer
      const groupedPurchasesMap = {};
      filteredPurchases.forEach(purchase => {
        const customerId = purchase.customer.customerId;
        if (!groupedPurchasesMap[customerId]) {
          groupedPurchasesMap[customerId] = {
            customer: purchase.customer,
            purchases: []
          };
        }
        groupedPurchasesMap[customerId].purchases.push(purchase);
      });
      
      const groupedPurchases = Object.values(groupedPurchasesMap);
      
      const doc = new jsPDF();
      const primaryColor = [147, 51, 234]; // Purple color
      
      // Build subtitle based on filters
      let subtitle = 'Analysis of customer activity and spending';
      if (appliedFilters.hasRating === 'yes') {
        subtitle = `Analysis of purchases with ${appliedFilters.minRating}+ star feedback`;
      } else if (appliedFilters.hasRating === 'no') {
        subtitle = 'Analysis of purchases without feedback';
      }
      
      // Add professional header with filter info
      const startY = addPdfHeader(doc, 'Customer Purchases Report', {
        subtitle,
        primaryColor
      });
      
      // Add filters applied section
      let filtersText = [];
      if (appliedFilters.purchaseDateStart) filtersText.push(`From: ${appliedFilters.purchaseDateStart}`);
      if (appliedFilters.purchaseDateEnd) filtersText.push(`To: ${appliedFilters.purchaseDateEnd}`);
      if (appliedFilters.minAmount) filtersText.push(`Min $${appliedFilters.minAmount}`);
      if (appliedFilters.maxAmount) filtersText.push(`Max $${appliedFilters.maxAmount}`);
      if (appliedFilters.hasRating !== 'all') {
        filtersText.push(`${appliedFilters.hasRating === 'yes' ? 'With' : 'Without'} Feedback`);
      }
      if (appliedFilters.hasRating === 'yes' && appliedFilters.minRating > 1) {
        filtersText.push(`${appliedFilters.minRating}+ Stars`);
      }
      
      if (filtersText.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Filters applied: ${filtersText.join(' | ')}`, 14, startY + 30);
      }
      
      // Calculate key statistics with filtered data
      let totalRevenue = 0;
      let totalTransactions = 0;
      let highestSpender = { name: 'N/A', amount: 0 };
      let avgSpendPerCustomer = 0;
      
      groupedPurchases.forEach(group => {
        const customerTotal = calculateTotalSpent(group.purchases);
        totalRevenue += parseFloat(customerTotal);
        totalTransactions += group.purchases.length;
        
        if (parseFloat(customerTotal) > highestSpender.amount) {
          highestSpender = {
            name: group.customer.name || group.customer.customerId,
            amount: parseFloat(customerTotal)
          };
        }
      });
      
      avgSpendPerCustomer = totalRevenue / groupedPurchases.length;
      
      // Add quick stats dashboard
      doc.setFillColor(240, 240, 250);
      doc.roundedRect(14, startY, doc.internal.pageSize.width - 28, 28, 3, 3, 'F');
      
      // Show key indicators
      const dashboardY = startY + 8;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      // Total customers indicator
      doc.text('Total Customers:', 24, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(groupedPurchases.length.toString(), 24, dashboardY + 8);
      
      // Total revenue indicator
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Revenue:', 84, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(46, 125, 50); // Green
      doc.setFont('helvetica', 'bold');
      doc.text(`$${totalRevenue.toFixed(2)}`, 84, dashboardY + 8);
      
      // Average spend indicator
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Avg. per Customer:', 144, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243); // Blue
      doc.setFont('helvetica', 'bold');
      doc.text(`$${avgSpendPerCustomer.toFixed(2)}`, 144, dashboardY + 8);
      
      // Format data for table
      const tableData = groupedPurchases.map((groupData) => {
        const { customer, purchases } = groupData;
        const totalSpent = calculateTotalSpent(purchases);
        const eventCount = purchases.length;
        const eventNames = purchases.map(p => p.event.name || 'Unknown Event').join(", ");
        const feedbackCount = purchases.filter(p => p.feedback).length;
        const lastPurchase = new Date(
          Math.max(...purchases.map(p => new Date(p.payment.date || 0)))
        ).toLocaleDateString();
        
        return [
          customer.customerId,
          customer.name || 'N/A',
          eventCount.toString(),
          `$${totalSpent}`,
          feedbackCount > 0 ? `${feedbackCount}/${eventCount}` : 'None',
          lastPurchase
        ];
      });
      
      // Create table with enhanced styling
      doc.autoTable({
        startY: startY + 35,
        head: [['ID', 'Customer Name', 'Events', 'Total Spent', 'Feedback', 'Last Purchase']],
        body: tableData,
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 245, 255]
        },
        columnStyles: {
          3: {
            halign: 'right',
            textColor: [46, 125, 50] // Green for money
          }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        margin: { top: startY + 35 }
      });
      
      // Get the final Y position after the table is rendered
      const finalY = doc.lastAutoTable.finalY;
      
      // Add note about top customers
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Highest spender: ${highestSpender.name} ($${highestSpender.amount.toFixed(2)})`, 
        14, finalY + 8
      );
      
      // Add comprehensive statistics summary
      const stats = [
        { label: 'Total Customers', value: groupedPurchases.length.toString() },
        { label: 'Total Transactions', value: totalTransactions.toString() },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
        { label: 'Avg. Spend/Customer', value: `$${avgSpendPerCustomer.toFixed(2)}` },
        { label: 'Highest Spend', value: `$${highestSpender.amount.toFixed(2)}` },
        { label: 'Avg. Events/Customer', value: (totalTransactions / groupedPurchases.length).toFixed(1) }
      ];
      
      addStatsSummary(doc, finalY + 15, stats, primaryColor);
      
      // Add footer
      addPdfFooter(doc, 1);
      
      // Save the PDF with timestamp and filter indication
      const dateStr = new Date().toISOString().split('T')[0];
      let filenameParts = ['customer_purchases_report'];
      
      if (appliedFilters.hasRating === 'yes') {
        filenameParts.push(`with_feedback_${appliedFilters.minRating}star`);
      } else if (appliedFilters.hasRating === 'no') {
        filenameParts.push('no_feedback');
      }
      
      if (appliedFilters.minAmount) {
        filenameParts.push(`min${appliedFilters.minAmount}`);
      }
      
      filenameParts.push(dateStr);
      doc.save(filenameParts.join('_') + '.pdf');
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
      
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={(appliedFilters) => {
            setFilters(appliedFilters);
            generatePDF(appliedFilters);
          }}
          currentFilters={filters}
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
              onClick={() => setShowFilterModal(true)}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaFilePdf className="mr-2" /> <FaFilter className="mr-1" /> Download PDF Report
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
