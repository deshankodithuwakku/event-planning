import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaCreditCard, FaUsers } from 'react-icons/fa';
import EditUser from './EditUser';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {isEditModalOpen && selectedUser && (
        <EditUser 
          user={selectedUser}
          onClose={handleEditClose}
          onSave={handleEditSave}
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
              <FaUsers className="mr-2" /> View Users
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
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Manage Events</h2>
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
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td> */}
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
