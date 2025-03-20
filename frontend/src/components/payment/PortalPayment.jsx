import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FaUniversity, FaMoneyCheckAlt } from 'react-icons/fa';

const PortalPayment = ({ amount, eventId, packageId, onCancel }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reference: '',
    description: `Payment for Event ${eventId}, Package ${packageId}`
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reference) {
      enqueueSnackbar('Please enter a payment reference', { variant: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      // Send payment data to backend
      const response = await axios.post('http://localhost:5555/api/payments/portal', {
        p_amount: amount,
        p_description: formData.description
      });
      
      enqueueSnackbar('Payment processed successfully!', { variant: 'success' });
      
      navigate('/payment/success', { 
        state: { 
          paymentId: response.data._id,
          amount,
          eventId,
          packageId,
          paymentMethod: 'Payment Portal'
        } 
      });
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.error || 'Failed to process payment',
        { variant: 'error' }
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-sky-700 mb-4">Payment Portal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="flex items-center text-gray-700 mb-2">
            <FaUniversity className="mr-2" /> 
            <span>Make a payment through your preferred payment portal</span>
          </div>
          <p className="text-sm text-gray-600">Transfer the amount of ${amount} to our account and provide the reference number below.</p>
        </div>
        
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Reference Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMoneyCheckAlt className="text-gray-400" />
            </div>
            <input
              type="text"
              id="reference"
              name="reference"
              placeholder="Enter your payment reference"
              value={formData.reference}
              onChange={handleChange}
              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="pt-4 flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-grow px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortalPayment;
