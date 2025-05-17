import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaStar, FaTrash, FaFilePdf, FaFilter } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { addPdfHeader, addPdfFooter, addStatsSummary } from '../../utils/pdfUtils';

const AdminFeedbackView = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  // Add filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    minRating: '1',
    maxRating: '5',
    dateFrom: '',
    dateTo: '',
    eventId: ''
  });
  
  // Store unique event IDs for filtering
  const [eventOptions, setEventOptions] = useState([]);

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

  useEffect(() => {
    // After loading feedbacks, extract unique event IDs for filter options
    if (feedbacks.length > 0) {
      const uniqueEvents = [...new Set(feedbacks
        .filter(f => f.eventId)
        .map(f => f.eventId))]
        .sort();
      setEventOptions(uniqueEvents);
    }
  }, [feedbacks]);

  // PDF Filter Modal Component
  const FilterModal = ({ onClose, onApply, currentFilters, eventOptions }) => {
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
          <h2 className="text-xl font-bold text-purple-800 mb-4">Filter Feedback Report</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Rating
                </label>
                <select
                  name="maxRating"
                  value={localFilters.maxRating}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
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
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event
              </label>
              <select
                name="eventId"
                value={localFilters.eventId}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Events</option>
                {eventOptions.map(eventId => (
                  <option key={eventId} value={eventId}>{eventId}</option>
                ))}
              </select>
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

  // Generate PDF report of all feedback
  const generatePDF = (appliedFilters = filters) => {
    try {
      // Filter feedbacks based on applied filters
      let filteredFeedbacks = [...feedbacks];
      
      // Rating range filter
      const minRating = parseInt(appliedFilters.minRating);
      const maxRating = parseInt(appliedFilters.maxRating);
      
      filteredFeedbacks = filteredFeedbacks.filter(feedback => {
        const rating = feedback.rating || 0;
        return rating >= minRating && rating <= maxRating;
      });
      
      // Date range filter
      if (appliedFilters.dateFrom) {
        const startDate = new Date(appliedFilters.dateFrom);
        filteredFeedbacks = filteredFeedbacks.filter(feedback => 
          feedback.createdAt ? new Date(feedback.createdAt) >= startDate : true
        );
      }
      
      if (appliedFilters.dateTo) {
        const endDate = new Date(appliedFilters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        filteredFeedbacks = filteredFeedbacks.filter(feedback => 
          feedback.createdAt ? new Date(feedback.createdAt) <= endDate : true
        );
      }
      
      // Event filter
      if (appliedFilters.eventId) {
        filteredFeedbacks = filteredFeedbacks.filter(feedback => 
          feedback.eventId === appliedFilters.eventId
        );
      }
      
      const doc = new jsPDF();
      const primaryColor = [147, 51, 234]; // Purple color
      
      // Build subtitle based on filters
      let subtitle = 'Analysis of customer satisfaction and comments';
      if (minRating > 1 || maxRating < 5) {
        subtitle = `Analysis of ${minRating}-${maxRating} star feedback`;
      }
      if (appliedFilters.eventId) {
        subtitle += ` for event ${appliedFilters.eventId}`;
      }
      
      // Add professional header
      const startY = addPdfHeader(doc, 'Customer Feedback Report', {
        subtitle,
        primaryColor
      });
      
      // Add filters applied section
      let filtersText = [];
      if (minRating > 1 || maxRating < 5) {
        filtersText.push(`Rating: ${minRating}-${maxRating} stars`);
      }
      if (appliedFilters.dateFrom) filtersText.push(`From: ${appliedFilters.dateFrom}`);
      if (appliedFilters.dateTo) filtersText.push(`To: ${appliedFilters.dateTo}`);
      if (appliedFilters.eventId) filtersText.push(`Event: ${appliedFilters.eventId}`);
      
      if (filtersText.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Filters applied: ${filtersText.join(' | ')}`, 14, startY + 30);
      }
      
      // Calculate key statistics using filtered data
      const totalFeedbacks = filteredFeedbacks.length;
      const totalRatings = filteredFeedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      const averageRating = totalFeedbacks > 0 ? totalRatings / totalFeedbacks : 0;
      
      // Count ratings by score using filtered data
      const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, index 4 = 5 stars
      filteredFeedbacks.forEach(feedback => {
        const rating = feedback.rating || 0;
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating - 1]++;
        }
      });
      
      // Find percentage of 4-5 star ratings (high satisfaction)
      const highSatisfaction = totalFeedbacks > 0 ? 
        ((ratingCounts[3] + ratingCounts[4]) / totalFeedbacks) * 100 : 0;
      
      // Add quick stats dashboard
      doc.setFillColor(240, 240, 250);
      doc.roundedRect(14, startY, doc.internal.pageSize.width - 28, 28, 3, 3, 'F');
      
      // Show key indicators
      const dashboardY = startY + 8;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      // Total feedbacks indicator
      doc.text('Total Feedbacks:', 24, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(totalFeedbacks.toString(), 24, dashboardY + 8);
      
      // Average rating indicator
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Average Rating:', 84, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243); // Blue
      doc.setFont('helvetica', 'bold');
      doc.text(`${averageRating.toFixed(1)}/5`, 84, dashboardY + 8);
      
      // High satisfaction indicator
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('High Satisfaction:', 144, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(46, 125, 50); // Green
      doc.setFont('helvetica', 'bold');
      doc.text(`${highSatisfaction.toFixed(1)}%`, 144, dashboardY + 8);
      
      // Add star ratings histogram
      const histogramY = startY + 45;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Rating Distribution', 14, histogramY);
      
      const maxRatingCount = Math.max(...ratingCounts);
      const barWidth = 20;
      const barMaxHeight = 40;
      const barSpacing = 10;
      const barX = 30;
      
      // Draw bars
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      for (let i = 0; i < 5; i++) {
        const count = ratingCounts[i];
        const barHeight = maxRatingCount > 0 ? (count / maxRatingCount) * barMaxHeight : 0;
        const x = barX + i * (barWidth + barSpacing);
        const y = histogramY + 30 - barHeight;
        
        // Draw bar
        doc.setFillColor(...primaryColor, (i + 1) * 40); // Varying opacity
        doc.rect(x, y, barWidth, barHeight, 'F');
        
        // Add star count
        doc.setTextColor(80, 80, 80);
        doc.text(`${i + 1} ★`, x + barWidth/2, histogramY + 35, { align: 'center' });
        
        // Add count
        doc.text(count.toString(), x + barWidth/2, y - 5, { align: 'center' });
      }
      
      // Format data for table - sort by date (newest first)
      const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      const tableData = sortedFeedbacks.map((feedback) => [
        new Date(feedback.createdAt).toLocaleDateString(),
        feedback.customerId || 'N/A',
        feedback.eventId || 'N/A',
        `${feedback.rating || 0}/5`,
        (feedback.message || '').substring(0, 50) + 
          ((feedback.message || '').length > 50 ? '...' : '')
      ]);
      
      // Create table with enhanced styling
      doc.autoTable({
        startY: histogramY + 45,
        head: [['Date', 'Customer ID', 'Event ID', 'Rating', 'Comment Excerpt']],
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
          3: { // Rating column
            fontStyle: 'bold',
            textColor: (value) => {
              const rating = parseInt(value.charAt(0));
              if (rating >= 4) return [46, 125, 50]; // green
              if (rating === 3) return [255, 152, 0]; // orange
              return [229, 57, 53]; // red
            }
          }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        margin: { left: 14, right: 14 }
      });
      
      // Get the final Y position after the table is rendered
      const finalY = doc.lastAutoTable.finalY;
      
      // Add comprehensive statistics summary
      const stats = [
        { label: 'Total Feedbacks', value: totalFeedbacks.toString() },
        { label: 'Average Rating', value: `${averageRating.toFixed(1)}/5` },
        { label: '5-Star Ratings', value: `${ratingCounts[4]} (${((ratingCounts[4]/totalFeedbacks)*100).toFixed(1)}%)` },
        { label: '4-Star Ratings', value: `${ratingCounts[3]} (${((ratingCounts[3]/totalFeedbacks)*100).toFixed(1)}%)` },
        { label: '3-Star Ratings', value: `${ratingCounts[2]} (${((ratingCounts[2]/totalFeedbacks)*100).toFixed(1)}%)` },
        { label: '2-Star Ratings', value: `${ratingCounts[1]} (${((ratingCounts[1]/totalFeedbacks)*100).toFixed(1)}%)` },
        { label: '1-Star Ratings', value: `${ratingCounts[0]} (${((ratingCounts[0]/totalFeedbacks)*100).toFixed(1)}%)` },
        { label: 'Satisfaction Rate', value: `${highSatisfaction.toFixed(1)}%` }
      ];
      
      addStatsSummary(doc, finalY + 15, stats, primaryColor);
      
      // Add footer
      addPdfFooter(doc, 1);
      
      // Save the PDF with timestamp and filter indication
      const dateStr = new Date().toISOString().split('T')[0];
      let filenameParts = ['customer_feedback_report'];
      
      if (minRating > 1 || maxRating < 5) {
        filenameParts.push(`${minRating}to${maxRating}stars`);
      }
      
      if (appliedFilters.eventId) {
        filenameParts.push(`event_${appliedFilters.eventId}`);
      }
      
      filenameParts.push(dateStr);
      doc.save(filenameParts.join('_') + '.pdf');
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
          
          {showFilterModal && (
            <FilterModal 
              onClose={() => setShowFilterModal(false)}
              onApply={(appliedFilters) => {
                setFilters(appliedFilters);
                generatePDF(appliedFilters);
              }}
              currentFilters={filters}
              eventOptions={eventOptions}
            />
          )}
          
          {!loading && feedbacks.length > 0 && (
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaFilePdf className="mr-2" /> <FaFilter className="mr-1" /> Download PDF Report
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
