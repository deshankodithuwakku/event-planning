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
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const primaryColor = [147, 51, 234]; // Purple color
      
      // Add professional header
      const startY = addPdfHeader(doc, 'Payment Transactions Report', {
        subtitle: `Filter: ${
          filter === 'all' ? 'All Payments' : filter === 'card' ? 'Card Payments' : 'Portal Payments'
        }`,
        primaryColor
      });
      
      // Calculate key statistics for dashboard
      let cardPayments = 0;
      let portalPayments = 0;
      let totalAmount = 0;
      let refundedPayments = 0;
      let refundedAmount = 0;
      let confirmedPayments = 0;
      let cancelledPayments = 0;
      
      payments.forEach(payment => {
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
      doc.text(payments.length.toString(), 24, dashboardY + 8);
      
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

      // Format data for table with more meaningful columns
      const tableData = payments.map((payment) => [
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
      
      // Add comprehensive statistics summary
      const stats = [
        { label: 'Total Payments', value: payments.length.toString() },
        { label: 'Total Amount', value: `$${totalAmount.toFixed(2)}` },
        { label: 'Card Payments', value: cardPayments.toString() },
        { label: 'Portal Payments', value: portalPayments.toString() },
        { label: 'Confirmed Payments', value: confirmedPayments.toString() },
        { label: 'Refunded Payments', value: refundedPayments.toString() },
        { label: 'Refunded Amount', value: `$${refundedAmount.toFixed(2)}` },
        { label: 'Cancelled Payments', value: cancelledPayments.toString() },
        { label: 'Average Payment', value: `$${(totalAmount / payments.length).toFixed(2)}` },
        { label: 'Card Payment %', value: `${((cardPayments / payments.length) * 100).toFixed(1)}%` }
      ];
      
      addStatsSummary(doc, finalY + 15, stats, primaryColor);
      
      // Add footer
      addPdfFooter(doc, 1);
      
      // Save the PDF with more descriptive filename including date
      const dateStr = new Date().toISOString().split('T')[0];
      doc.save(`payment_transactions_report_${dateStr}.pdf`);
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
              onClick={generatePDF}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaFilePdf className="mr-2" /> Download PDF Report
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
