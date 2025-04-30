import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaStar, FaTrash, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminFeedbackView = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchFeedbacks();
  }, [navigate]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5555/api/feedback');
      setFeedbacks(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch feedback', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF report of all feedback
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Customer Feedback Report', 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      
      // Format data for table
      const tableData = feedbacks.map((feedback) => [
        new Date(feedback.createdAt).toLocaleDateString(),
        feedback.customerId,
        `${feedback.rating || 0}/5`,
        feedback.message.slice(0, 60) + (feedback.message.length > 60 ? '...' : '')
      ]);
      
      // Create table
      doc.autoTable({
        startY: 30,
        head: [['Date', 'Customer ID', 'Rating', 'Feedback']],
        body: tableData,
        headStyles: {
          fillColor: [100, 116, 139],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [240, 245, 255]
        },
        margin: { top: 30 }
      });
      
      // Add summary
      const averageRating = feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbacks.length;
      doc.text(`Total Feedbacks: ${feedbacks.length}`, 14, doc.lastAutoTable.finalY + 10);
      doc.text(`Average Rating: ${averageRating.toFixed(1)}/5`, 14, doc.lastAutoTable.finalY + 15);
      
      // Save the PDF
      doc.save('customer_feedback_report.pdf');
      enqueueSnackbar('PDF generated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('PDF generation error:', error);
      enqueueSnackbar('Failed to generate PDF', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        // Need to get admin ID for deletion authorization
        const adminData = JSON.parse(localStorage.getItem('adminData'));
        const adminId = adminData.A_ID || adminData.userId;
        
        await axios.delete(`http://localhost:5555/api/feedback/${id}`, {
          data: { customerId: adminId }
        });
        
        enqueueSnackbar('Feedback deleted successfully', { variant: 'success' });
        setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
      } catch (error) {
        enqueueSnackbar('Failed to delete feedback', { variant: 'error' });
      }
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar 
        key={index}
        className="star"
        color={index < rating ? "#ffc107" : "#e4e5e9"}
        size={16}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          
          {!loading && feedbacks.length > 0 && (
            <button
              onClick={generatePDF}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaFilePdf className="mr-2" /> Download PDF Report
            </button>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">All Customer Feedback</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading feedback...</div>
          ) : feedbacks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No feedback submissions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedbacks.map((feedback) => (
                    <tr key={feedback._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feedback.customerId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {renderStars(feedback.rating || 0)}
                          <span className="text-sm">({feedback.rating || 0}/5)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs break-words">{feedback.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(feedback._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <FaTrash /> Delete
                        </button>
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

export default AdminFeedbackView;
