import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaCreditCard, FaWallet, FaFilter, FaEdit, FaTrash, FaFilePdf, FaUndoAlt } from 'react-icons/fa';
import EditPayment from './EditPayment';
import { getImageUrl } from '../../utils/urlHelper';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { addPdfHeader, addPdfFooter, addStatsSummary } from '../../utils/pdfUtils';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'card', 'portal'
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [events, setEvents] = useState({}); // Store events by ID for quick lookup

  // Add filter state for PDF reports
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pdfFilters, setPdfFilters] = useState({
    paymentType: 'all',
    paymentStatus: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchPayments();
    fetchEvents(); // Fetch all events to get their names
  }, [navigate, filter]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5555/api/events');
      const eventsMap = {};

      // Fix for the forEach error - handle both possible response structures
      const eventsData = response.data.data || response.data;
      if (Array.isArray(eventsData)) {
        eventsData.forEach((event) => {
          eventsMap[event.E_ID] = event.E_name;
        });
      } else {
        console.warn('Events data is not in expected format:', response.data);
      }

      setEvents(eventsMap);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

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

  const handleRefundPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to refund this payment?')) {
      return;
    }
    
    try {
      // Add error handling with better logging
      const response = await axios.patch(`http://localhost:5555/api/payments/admin/refund/${paymentId}`);
      console.log('Refund response:', response.data);
      enqueueSnackbar('Payment refunded successfully', { variant: 'success' });
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Refund error:', error.response?.data || error.message);
      enqueueSnackbar(
        error.response?.data?.error || 'Failed to refund payment. Check server logs for details', 
        { variant: 'error' }
      );
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
          <h2 className="text-xl font-bold text-purple-800 mb-4">Filter Payment Report</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type
              </label>
              <select
                name="paymentType"
                value={localFilters.paymentType}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="Card">Card Payments</option>
                <option value="Portal">Portal Payments</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={localFilters.paymentStatus}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={localFilters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={localFilters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
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

  // Modify the payment status badge renderer to highlight refunded payments
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
      case 'refunded':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Refunded</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Pending</span>;
    }
  };

  // Generate PDF report of all payments
  const generatePDF = (appliedFilters = pdfFilters) => {
    try {
      // Filter payments based on applied filters
      let filteredPayments = [...payments];
      
      // Filter by payment type
      if (appliedFilters.paymentType !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.paymentType === appliedFilters.paymentType);
      }
      
      // Filter by payment status
      if (appliedFilters.paymentStatus !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.status === appliedFilters.paymentStatus);
      }
      
      // Filter by date range
      if (appliedFilters.dateFrom) {
        const startDate = new Date(appliedFilters.dateFrom);
        filteredPayments = filteredPayments.filter(p => 
          p.p_date ? new Date(p.p_date) >= startDate : true
        );
      }
      
      if (appliedFilters.dateTo) {
        const endDate = new Date(appliedFilters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        filteredPayments = filteredPayments.filter(p => 
          p.p_date ? new Date(p.p_date) <= endDate : true
        );
      }
      
      // Filter by amount range
      if (appliedFilters.minAmount) {
        const minAmount = parseFloat(appliedFilters.minAmount);
        filteredPayments = filteredPayments.filter(p => 
          p.p_amount ? parseFloat(p.p_amount) >= minAmount : true
        );
      }
      
      if (appliedFilters.maxAmount) {
        const maxAmount = parseFloat(appliedFilters.maxAmount);
        filteredPayments = filteredPayments.filter(p => 
          p.p_amount ? parseFloat(p.p_amount) <= maxAmount : true
        );
      }

      const doc = new jsPDF();
      const primaryColor = [147, 51, 234]; // Purple color
      
      // Build subtitle based on filters
      let subtitle = 'Payment Transactions Report';
      if (appliedFilters.paymentType !== 'all') {
        subtitle = `${appliedFilters.paymentType} Payments Report`;
      }
      if (appliedFilters.paymentStatus !== 'all') {
        subtitle += ` - ${appliedFilters.paymentStatus} status`;
      }
      
      // Add professional header
      const startY = addPdfHeader(doc, 'Payment Transactions Report', {
        subtitle,
        primaryColor
      });
      
      // Add filters applied section
      let filtersText = [];
      if (appliedFilters.paymentType !== 'all') filtersText.push(`Type: ${appliedFilters.paymentType}`);
      if (appliedFilters.paymentStatus !== 'all') filtersText.push(`Status: ${appliedFilters.paymentStatus}`);
      if (appliedFilters.dateFrom) filtersText.push(`From: ${appliedFilters.dateFrom}`);
      if (appliedFilters.dateTo) filtersText.push(`To: ${appliedFilters.dateTo}`);
      if (appliedFilters.minAmount) filtersText.push(`Min: $${appliedFilters.minAmount}`);
      if (appliedFilters.maxAmount) filtersText.push(`Max: $${appliedFilters.maxAmount}`);
      
      if (filtersText.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Filters applied: ${filtersText.join(' | ')}`, 14, startY + 30);
      }
      
      // Calculate key statistics from filtered payments for dashboard
      let cardPayments = 0;
      let portalPayments = 0;
      let totalAmount = 0;
      let refundedPayments = 0;
      let refundedAmount = 0;
      let confirmedPayments = 0;
      let cancelledPayments = 0;
      
      filteredPayments.forEach(payment => {
        if (payment.paymentType === 'Card') cardPayments++;
        else if (payment.paymentType === 'Portal') portalPayments++;
        
        if (payment.status === 'refunded') {
          refundedPayments++;
          refundedAmount += payment.p_amount;
        } else if (payment.status === 'confirmed') {
          confirmedPayments++;
        } else if (payment.status === 'cancelled') {
          cancelledPayments++;
        }
        
        totalAmount += payment.p_amount;
      });

      // Add quick statistics dashboard at the top
      doc.setFillColor(240, 240, 250);
      doc.roundedRect(14, startY, doc.internal.pageSize.width - 28, 28, 3, 3, 'F');
      
      // Show key indicators
      const dashboardY = startY + 8;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      // Total payments indicator
      doc.text('Total Payments:', 24, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(filteredPayments.length.toString(), 24, dashboardY + 8);
      
      // Total amount indicator
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Amount:', 84, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(46, 125, 50); // Green color for money
      doc.setFont('helvetica', 'bold');
      doc.text(`$${totalAmount.toFixed(2)}`, 84, dashboardY + 8);
      
      // Card/Portal split
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Card / Portal Split:', 144, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cardPayments} / ${portalPayments}`, 144, dashboardY + 8);

      // Format data for table with more meaningful columns - now using filtered payments
      const tableData = filteredPayments.map((payment) => [
        payment.P_ID,
        payment.customerId || 'N/A',
        events[payment.eventId] || payment.eventId || 'Unknown',
        payment.paymentType,
        `$${payment.p_amount}`,
        payment.status,
        new Date(payment.p_date).toLocaleDateString(),
        payment.paymentType === 'Card' ? (payment.c_description || '').substring(0, 20) : 
                                        (payment.p_description || '').substring(0, 20)
      ]);

      // Create table with updated headers and better styling
      doc.autoTable({
        startY: startY + 35,
        head: [['ID', 'Customer', 'Event', 'Type', 'Amount', 'Status', 'Date', 'Description']],
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
          4: {halign: 'right'}, // Right-align amount column
          5: {
            fontStyle: (value) => {
              return value === 'confirmed' ? 'bold' : 'normal';
            },
            textColor: (value) => {
              if (value === 'confirmed') return [46, 125, 50]; // green
              if (value === 'refunded') return [33, 150, 243]; // blue
              if (value === 'cancelled') return [229, 57, 53]; // red
              return [80, 80, 80]; // default gray
            }
          }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        margin: { top: startY + 35 },
      });
      
      // Get the final Y position after the table is rendered
      const finalY = doc.lastAutoTable.finalY;
      
      // Add comprehensive statistics summary with filtered data
      const stats = [
        { label: 'Total Payments', value: filteredPayments.length.toString() },
        { label: 'Total Amount', value: `$${totalAmount.toFixed(2)}` },
        { label: 'Card Payments', value: cardPayments.toString() },
        { label: 'Portal Payments', value: portalPayments.toString() },
        { label: 'Confirmed Payments', value: confirmedPayments.toString() },
        { label: 'Refunded Payments', value: refundedPayments.toString() },
        { label: 'Refunded Amount', value: `$${refundedAmount.toFixed(2)}` },
        { label: 'Cancelled Payments', value: cancelledPayments.toString() },
        { label: 'Average Payment', value: filteredPayments.length ? `$${(totalAmount / filteredPayments.length).toFixed(2)}` : '$0.00' },
        { label: 'Card Payment %', value: filteredPayments.length ? `${((cardPayments / filteredPayments.length) * 100).toFixed(1)}%` : '0%' }
      ];
      
      addStatsSummary(doc, finalY + 15, stats, primaryColor);
      
      // Add footer
      addPdfFooter(doc, 1);
      
      // Save the PDF with more descriptive filename including date and filters
      const dateStr = new Date().toISOString().split('T')[0];
      let filenameParts = ['payment_transactions_report'];
      
      if (appliedFilters.paymentType !== 'all') {
        filenameParts.push(appliedFilters.paymentType.toLowerCase());
      }
      
      if (appliedFilters.paymentStatus !== 'all') {
        filenameParts.push(appliedFilters.paymentStatus);
      }
      
      filenameParts.push(dateStr);
      doc.save(filenameParts.join('_') + '.pdf');
      enqueueSnackbar('PDF generated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('PDF generation error:', error);
      enqueueSnackbar('Failed to generate PDF', { variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {isEditModalOpen && selectedPayment && (
        <EditPayment payment={selectedPayment} onClose={handleEditClose} onSave={handleEditSave} />
      )}
      
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={(appliedFilters) => {
            setPdfFilters(appliedFilters);
            generatePDF(appliedFilters);
          }}
          currentFilters={pdfFilters}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>

          {!loading && payments.length > 0 && (
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
            <div className="p-6 text-center text-gray-500">No payment records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Slip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className={payment.status === 'refunded' ? 'bg-blue-50' : payment.status === 'cancelled' ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.P_ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.customerId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {events[payment.eventId] || 'Unknown Event'}
                      </td>
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
                        {getPaymentStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditClick(payment)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <FaEdit />
                          </button>
                          
                          {payment.status === 'confirmed' && (
                            <button
                              onClick={() => handleRefundPayment(payment._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Refund payment"
                            >
                              <FaUndoAlt />
                            </button>
                          )}
                          
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
