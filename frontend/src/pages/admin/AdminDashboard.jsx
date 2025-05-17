import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaCreditCard, FaUsers, FaComments, FaFilePdf, FaShoppingCart, FaFilter } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import EditUser from './EditUser';
import { addPdfHeader, addPdfFooter, addStatsSummary } from '../../utils/pdfUtils';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    minCapacity: '',
    maxCapacity: ''
  });
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const storedAdminData = localStorage.getItem('adminData');
    if (!storedAdminData) {
      navigate('/admin/login');
      return;
    }

    setAdminData(JSON.parse(storedAdminData));
    fetchEvents();
    fetchUsers();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      // Get the admin token from localStorage
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get('http://localhost:5555/api/events', config);
      setEvents(response.data.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch events', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Get the admin token from localStorage
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // // Use the new unified users endpoint with proper authorization
      // const response = await axios.get('http://localhost:5555/api/users/customers', config);
      // setUsers(response.data.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('userRole');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/admin/login');
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://localhost:5555/api/events/${eventId}`);
        enqueueSnackbar('Event deleted successfully', { variant: 'success' });
        fetchEvents();
      } catch (error) {
        enqueueSnackbar('Failed to delete event', { variant: 'error' });
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5555/api/customers/${userId}`);
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        fetchUsers();
      } catch (error) {
        enqueueSnackbar('Failed to delete user', { variant: 'error' });
      }
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditSave = async (editedUser) => {
    try {
      await axios.put(`http://localhost:5555/api/customers/${editedUser.C_ID}`, editedUser);
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setIsEditModalOpen(false);
      fetchUsers(); // Refresh the users list
    } catch (error) {
      enqueueSnackbar('Failed to update user', { variant: 'error' });
    }
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
          <h2 className="text-xl font-bold text-purple-800 mb-4">Filter Event Report</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Status
              </label>
              <select
                name="status"
                value={localFilters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={localFilters.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={localFilters.endDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Capacity
                </label>
                <input
                  type="number"
                  name="minCapacity"
                  value={localFilters.minCapacity}
                  onChange={handleFilterChange}
                  placeholder="No minimum"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Capacity
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={localFilters.maxCapacity}
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

  // Generate PDF report of all events
  const generateEventsPDF = (appliedFilters = filters) => {
    try {
      // Filter events based on applied filters
      let filteredEvents = [...events];
      
      // Filter by status
      if (appliedFilters.status !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.status === appliedFilters.status);
      }
      
      // Filter by date range if provided
      if (appliedFilters.startDate) {
        const startDate = new Date(appliedFilters.startDate);
        filteredEvents = filteredEvents.filter(e => 
          e.date ? new Date(e.date) >= startDate : true
        );
      }
      
      if (appliedFilters.endDate) {
        const endDate = new Date(appliedFilters.endDate);
        // Set to end of day
        endDate.setHours(23, 59, 59, 999);
        filteredEvents = filteredEvents.filter(e => 
          e.date ? new Date(e.date) <= endDate : true
        );
      }
      
      // Filter by capacity range if provided
      if (appliedFilters.minCapacity) {
        const minCapacity = parseInt(appliedFilters.minCapacity);
        filteredEvents = filteredEvents.filter(e => 
          e.E_capacity ? parseInt(e.E_capacity) >= minCapacity : true
        );
      }
      
      if (appliedFilters.maxCapacity) {
        const maxCapacity = parseInt(appliedFilters.maxCapacity);
        filteredEvents = filteredEvents.filter(e => 
          e.E_capacity ? parseInt(e.E_capacity) <= maxCapacity : true
        );
      }

      const doc = new jsPDF();
      const primaryColor = [147, 51, 234]; // Purple color
      
      // Add professional header
      const startY = addPdfHeader(doc, 'Events Management Report', {
        subtitle: `Overview of ${appliedFilters.status !== 'all' ? appliedFilters.status : 'all'} events`,
        primaryColor
      });
      
      // Calculate key event statistics from filtered events
      const activeEvents = filteredEvents.filter(e => e.status === 'active').length;
      const cancelledEvents = filteredEvents.filter(e => e.status === 'cancelled').length;
      const completedEvents = filteredEvents.filter(e => e.status === 'completed').length;
      const pendingEvents = filteredEvents.filter(e => e.status === 'pending').length;
      
      // Add quick stats dashboard
      doc.setFillColor(240, 240, 250);
      doc.roundedRect(14, startY, doc.internal.pageSize.width - 28, 28, 3, 3, 'F');
      
      // Show key indicators
      const dashboardY = startY + 8;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      // Total events indicator
      doc.text('Total Events:', 24, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(events.length.toString(), 24, dashboardY + 8);
      
      // Active events indicator
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Active Events:', 84, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(46, 125, 50); // Green
      doc.setFont('helvetica', 'bold');
      doc.text(activeEvents.toString(), 84, dashboardY + 8);
      
      // Format data for table with more information
      const tableData = filteredEvents.map((event) => [
        event.E_ID,
        event.E_name,
        event.status,
        event.E_location || 'Not specified',
        event.E_capacity ? event.E_capacity.toString() : 'N/A'
      ]);
      
      // Create table with enhanced headers and styling
      doc.autoTable({
        startY: startY + 35,
        head: [['Event ID', 'Event Name', 'Status', 'Location', 'Capacity']],
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
          2: { // Status column
            fontStyle: (value) => {
              return value === 'active' ? 'bold' : 'normal';
            },
            textColor: (value) => {
              if (value === 'active') return [46, 125, 50]; // green
              if (value === 'cancelled') return [229, 57, 53]; // red
              if (value === 'completed') return [33, 150, 243]; // blue
              return [80, 80, 80]; // default gray
            }
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
      
      // Add comprehensive statistics summary
      const stats = [
        { label: 'Total Events', value: events.length.toString() },
        { label: 'Active Events', value: activeEvents.toString() },
        { label: 'Cancelled Events', value: cancelledEvents.toString() },
        { label: 'Completed Events', value: completedEvents.toString() },
        { label: 'Pending Events', value: pendingEvents.toString() },
        { label: 'Active %', value: `${((activeEvents / events.length) * 100).toFixed(1)}%` }
      ];
      
      addStatsSummary(doc, finalY + 15, stats, primaryColor);
      
      // Add filters applied section
      let filtersText = [];
      if (appliedFilters.status !== 'all') filtersText.push(`Status: ${appliedFilters.status}`);
      if (appliedFilters.startDate) filtersText.push(`From: ${appliedFilters.startDate}`);
      if (appliedFilters.endDate) filtersText.push(`To: ${appliedFilters.endDate}`);
      if (appliedFilters.minCapacity) filtersText.push(`Min Capacity: ${appliedFilters.minCapacity}`);
      if (appliedFilters.maxCapacity) filtersText.push(`Max Capacity: ${appliedFilters.maxCapacity}`);
      
      if (filtersText.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Filters applied: ${filtersText.join(' | ')}`, 14, startY + 30);
      }
      
      // Add footer
      addPdfFooter(doc, 1);
      
      // Save the PDF with timestamp and filter indication
      const dateStr = new Date().toISOString().split('T')[0];
      const filterIndicator = appliedFilters.status !== 'all' ? `_${appliedFilters.status}` : '';
      doc.save(`event_management_report${filterIndicator}_${dateStr}.pdf`);
      enqueueSnackbar('PDF generated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('PDF generation error:', error);
      enqueueSnackbar('Failed to generate PDF', { variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {isEditModalOpen && selectedUser && (
        <EditUser 
          user={selectedUser}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}
      
      {showFilterModal && (
        <FilterModal 
          onClose={() => setShowFilterModal(false)}
          onApply={(appliedFilters) => {
            setFilters(appliedFilters);
            generateEventsPDF(appliedFilters);
          }}
          currentFilters={filters}
        />
      )}
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Admin Dashboard</h1>
            {adminData && (
              <p className="text-gray-600">Welcome, {adminData.userName}</p>
            )}
          </div>
          <div className="flex space-x-4">
            <Link
              to="/admin/events/create"
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              <FaPlus className="mr-2" /> Create Event
            </Link>
            <Link
              to="/admin/payments"
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              <FaCreditCard className="mr-2" /> View Payments
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              <FaUsers className="mr-2" /> View Customers 
            </Link>
            <Link
              to="/admin/customer-purchases"
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              <FaShoppingCart className="mr-2" /> Customer Purchases
            </Link>
            <Link
              to="/admin/feedback"
              className="flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
            >
              <FaComments className="mr-2" /> View Feedback
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Manage Events</h2>
            
            {!loading && events.length > 0 && (
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700 transition-colors"
              >
                <FaFilePdf className="mr-1" /> <FaFilter className="mr-1" /> PDF Report
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="p-6 text-center">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No events found. Create your first event!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.E_ID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${event.status === 'active' ? 'bg-green-100 text-green-800' : 
                            event.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link to={`/admin/events/${event.E_ID}`} className="text-indigo-600 hover:text-indigo-900">
                            View
                          </Link>
                          <Link to={`/admin/events/edit/${event.E_ID}`} className="text-purple-600 hover:text-purple-900">
                            <FaEdit />
                          </Link>
                          <button 
                            onClick={() => handleDeleteEvent(event.E_ID)}
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

        {/* The users section is now moved to its own page */}
      </div>
    </div>
  );
};

export default AdminDashboard;
