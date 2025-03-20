import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

const PackageCreate = () => {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [packages, setPackages] = useState([]);
  const [currentPackage, setCurrentPackage] = useState({
    Pg_ID: '',
    Pg_price: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    // Fetch event details and generate package ID
    const fetchData = async () => {
      try {
        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5555/api/events/${eventId}`);
        setEventDetails(eventResponse.data);
        
        // Generate package ID
        const packageResponse = await axios.get('http://localhost:5555/api/packages/generate-id');
        setCurrentPackage(prev => ({ ...prev, Pg_ID: packageResponse.data.id }));
      } catch (error) {
        enqueueSnackbar('Failed to fetch data', { variant: 'error' });
      } finally {
        setFetchingId(false);
      }
    };

    fetchData();
  }, [eventId, navigate, enqueueSnackbar]);

  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    setCurrentPackage({
      ...currentPackage,
      [name]: name === 'Pg_price' ? value === '' ? '' : Number(value) : value
    });
  };

  const addPackage = async () => {
    // Validate package data
    if (!currentPackage.Pg_ID || !currentPackage.Pg_price) {
      enqueueSnackbar('Please fill in all required package fields', { variant: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data for API call
      const packageData = {
        Pg_ID: currentPackage.Pg_ID,
        Pg_price: currentPackage.Pg_price,
        event: eventId
      };
      
      // Create package
      await axios.post('http://localhost:5555/api/packages', packageData);
      
      // Add to local state
      setPackages([...packages, packageData]);
      
      // Reset form and get new ID
      setCurrentPackage({
        Pg_ID: '',
        Pg_price: '',
      });
      
      // Generate new package ID
      const packageResponse = await axios.get('http://localhost:5555/api/packages/generate-id');
      setCurrentPackage(prev => ({ ...prev, Pg_ID: packageResponse.data.id }));
      
      enqueueSnackbar('Package added successfully!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to add package',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const finishAndGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-purple-800">Add Packages</h2>
            {eventDetails && (
              <p className="text-gray-600 mt-1">
                Event: {eventDetails.E_name}
              </p>
            )}
          </div>
          
          {packages.length > 0 && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Added Packages</h3>
              <div className="space-y-4">
                {packages.map((pkg, index) => (
                  <div key={index} className="p-4 bg-white shadow rounded border border-gray-200">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">Package: {pkg.Pg_ID}</h4>
                      <span className="text-purple-600 font-medium">${pkg.Pg_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="Pg_ID" className="block text-sm font-medium text-gray-700 mb-1">
                  Package ID (Auto-generated)
                </label>
                <input
                  id="Pg_ID"
                  name="Pg_ID"
                  type="text"
                  value={fetchingId ? "Generating ID..." : currentPackage.Pg_ID}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label htmlFor="Pg_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price * ($)
                </label>
                <input
                  id="Pg_price"
                  name="Pg_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentPackage.Pg_price}
                  onChange={handlePackageChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter package price"
                />
              </div>
              
              <div className="pt-4 flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={addPackage}
                  disabled={loading}
                  className={`flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white ${
                    loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  {loading ? 'Adding Package...' : (
                    <>
                      <FaPlus className="mr-2" /> Add Package
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={finishAndGoToDashboard}
                  className="w-full px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Finish and Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageCreate;
