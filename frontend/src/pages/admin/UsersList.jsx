import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaTrash, FaUsers, FaFilePdf, FaFilter } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import EditUser from './EditUser';
import api from '../../utils/api';
import { addPdfHeader, addPdfFooter, addStatsSummary } from '../../utils/pdfUtils';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Add filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    verificationStatus: 'all',
    joinedAfter: '',
    joinedBefore: ''
  });

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('http://localhost:5555/api/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response && error.response.status === 401) {
        enqueueSnackbar('Your session has expired. Please log in again.', { variant: 'error' });
        navigate('/admin/login');
      } else {
        enqueueSnackbar('Failed to fetch users', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`http://localhost:5555/api/users/${userId}`);
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
      await axios.put(`http://localhost:5555/api/users/${editedUser.userId}`, editedUser);
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setIsEditModalOpen(false);
      fetchUsers();
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
          <h2 className="text-xl font-bold text-purple-800 mb-4">Filter Users Report</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Role
              </label>
              <select
                name="role"
                value={localFilters.role}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="customer">Customers</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Status
              </label>
              <select
                name="verificationStatus"
                value={localFilters.verificationStatus}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joined After
                </label>
                <input
                  type="date"
                  name="joinedAfter"
                  value={localFilters.joinedAfter}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joined Before
                </label>
                <input
                  type="date"
                  name="joinedBefore"
                  value={localFilters.joinedBefore}
                  onChange={handleFilterChange}
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

  // Generate PDF report of all users
  const generatePDF = (appliedFilters = filters) => {
    try {
      // Filter users based on applied filters
      let filteredUsers = [...users];
      
      // Filter by role
      if (appliedFilters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === appliedFilters.role);
      }
      
      // Filter by verification status
      if (appliedFilters.verificationStatus !== 'all') {
        const isVerified = appliedFilters.verificationStatus === 'verified';
        filteredUsers = filteredUsers.filter(user => user.verified === isVerified);
      }
      
      // Filter by join date range if provided
      if (appliedFilters.joinedAfter) {
        const startDate = new Date(appliedFilters.joinedAfter);
        filteredUsers = filteredUsers.filter(user => 
          user.createdAt ? new Date(user.createdAt) >= startDate : true
        );
      }
      
      if (appliedFilters.joinedBefore) {
        const endDate = new Date(appliedFilters.joinedBefore);
        // Set to end of day
        endDate.setHours(23, 59, 59, 999);
        filteredUsers = filteredUsers.filter(user => 
          user.createdAt ? new Date(user.createdAt) <= endDate : true
        );
      }
      
      const doc = new jsPDF();
      const primaryColor = [147, 51, 234]; // Purple color
      
      // Build subtitle based on filters
      let subtitle = 'Complete user database overview';
      if (appliedFilters.role !== 'all') {
        subtitle = `Overview of ${appliedFilters.role} users`;
      }
      if (appliedFilters.verificationStatus !== 'all') {
        subtitle += ` (${appliedFilters.verificationStatus})`;
      }
      
      // Add professional header
      const startY = addPdfHeader(doc, 'User Management Report', {
        subtitle,
        primaryColor
      });
      
      // Calculate key statistics from filtered users
      const adminCount = filteredUsers.filter(user => user.role === 'admin').length;
      const customerCount = filteredUsers.filter(user => user.role === 'customer').length;
      const verifiedCount = filteredUsers.filter(user => user.verified).length;
      
      // Add filters applied section
      let filtersText = [];
      if (appliedFilters.role !== 'all') filtersText.push(`Role: ${appliedFilters.role}`);
      if (appliedFilters.verificationStatus !== 'all') filtersText.push(`Status: ${appliedFilters.verificationStatus}`);
      if (appliedFilters.joinedAfter) filtersText.push(`Joined after: ${appliedFilters.joinedAfter}`);
      if (appliedFilters.joinedBefore) filtersText.push(`Joined before: ${appliedFilters.joinedBefore}`);
      
      if (filtersText.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Filters applied: ${filtersText.join(' | ')}`, 14, startY + 30);
      }
      
      // Add quick stats dashboard
      doc.setFillColor(240, 240, 250);
      doc.roundedRect(14, startY + 35, doc.internal.pageSize.width - 28, 28, 3, 3, 'F');
      
      // Show key indicators
      const dashboardY = startY + 43;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      // Total users indicator
      doc.text('Total Users:', 24, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(filteredUsers.length.toString(), 24, dashboardY + 8);
      
      // Customer count indicator
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Customers:', 84, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(46, 125, 50); // Green
      doc.setFont('helvetica', 'bold');
      doc.text(customerCount.toString(), 84, dashboardY + 8);
      
      // Admin count indicator
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Admins:', 144, dashboardY);
      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243); // Blue
      doc.setFont('helvetica', 'bold');
      doc.text(adminCount.toString(), 144, dashboardY + 8);
      
      // Format data for table with role indication
      const tableData = filteredUsers.map((user) => [
        user.userId,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        user.userName || 'N/A',
        user.phoneNo || 'N/A',
        user.role === 'admin' ? 'Admin' : 'Customer',
        user.verified ? 'Yes' : 'No',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
      ]);
      
      // Create table with enhanced styling
      doc.autoTable({
        startY: startY + 70,
        head: [['User ID', 'Full Name', 'Email', 'Phone', 'Role', 'Verified', 'Joined Date']],
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
          4: { // Role column
            fontStyle: (value) => {
              return value === 'Admin' ? 'bold' : 'normal';
            },
            textColor: (value) => {
              return value === 'Admin' ? [33, 150, 243] : [46, 125, 50]; // Blue for admin, green for customer
            }
          },
          5: { // Verified column
            halign: 'center',
            textColor: (value) => {
              return value === 'Yes' ? [46, 125, 50] : [229, 57, 53]; // Green for yes, red for no
            }
          }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        margin: { top: startY + 70 }
      });
      
      // Get the final Y position after the table is rendered
      const finalY = doc.lastAutoTable.finalY;
      
      // Add comprehensive statistics summary
      const stats = [
        { label: 'Total Users', value: filteredUsers.length.toString() },
        { label: 'Admins', value: adminCount.toString() },
        { label: 'Customers', value: customerCount.toString() },
        { label: 'Verified Users', value: verifiedCount.toString() },
        { label: 'Admin %', value: `${((adminCount / filteredUsers.length) * 100).toFixed(1)}%` },
        { label: 'Verified %', value: `${((verifiedCount / filteredUsers.length) * 100).toFixed(1)}%` }
      ];
      
      addStatsSummary(doc, finalY + 15, stats, primaryColor);
      
      // Add footer
      addPdfFooter(doc, 1);
      
      // Save the PDF with timestamp
      const dateStr = new Date().toISOString().split('T')[0];
      const filterIndicator = appliedFilters.role !== 'all' ? `_${appliedFilters.role}` : '';
      doc.save(`user_management_report${filterIndicator}_${dateStr}.pdf`);
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
            generatePDF(appliedFilters);
          }}
          currentFilters={filters}
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
          
          {!loading && users.length > 0 && (
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
            <h2 className="text-2xl font-semibold text-purple-800">All Users</h2>
            <div className="flex items-center text-purple-600">
              <FaUsers className="mr-2" /> {users.length} Users
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.firstName || ''} {user.lastName || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* <button 
                            onClick={() => handleEditClick(user)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <FaEdit />
                          </button> */}
                          <button 
                            onClick={() => handleDeleteUser(user.userId)}
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

export default UsersList;
