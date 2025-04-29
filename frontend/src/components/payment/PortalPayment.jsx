import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FaUniversity, FaMoneyCheckAlt, FaUpload, FaFileImage, FaSpinner, FaTrash } from 'react-icons/fa';

const PortalPayment = ({ amount, eventId, packageId, onCancel }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    reference: '',
    description: `Payment for Event ${eventId}, Package ${packageId}`
  });
  const [bankSlip, setBankSlip] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please upload an image file (JPG, PNG, etc)', { variant: 'error' });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('File is too large. Maximum size is 5MB', { variant: 'error' });
      return;
    }

    setBankSlip(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setBankSlip(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const validateForm = () => {
    // Reference validation - should be alphanumeric and at least 6 characters
    const referenceRegex = /^[a-zA-Z0-9-_]{6,}$/;
    if (!formData.reference || !referenceRegex.test(formData.reference)) {
      enqueueSnackbar('Please enter a valid reference number (at least 6 alphanumeric characters)', { variant: 'error' });
      return false;
    }

    // Description validation - should not be empty and not too long
    if (!formData.description || formData.description.trim() === '') {
      enqueueSnackbar('Please enter a payment description', { variant: 'error' });
      return false;
    }

    if (formData.description.length > 200) {
      enqueueSnackbar('Description is too long (maximum 200 characters)', { variant: 'error' });
      return false;
    }

    // Bank slip validation
    if (!bankSlip) {
      enqueueSnackbar('Please upload a bank slip as proof of payment', { variant: 'error' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run full validation check
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Get customer ID from local storage
      const customerData = localStorage.getItem('customerData');
      if (!customerData) {
        enqueueSnackbar('You must be logged in to make a payment', { variant: 'error' });
        setLoading(false);
        return;
      }
      
      const customer = JSON.parse(customerData);
      const customerId = customer.C_ID;
      
      // First, upload the bank slip
      setUploadLoading(true);
      console.log('Preparing to upload bank slip...');
      
      if (!bankSlip) {
        enqueueSnackbar('Please select a bank slip image', { variant: 'error' });
        setLoading(false);
        setUploadLoading(false);
        return;
      }
      
      // Create form data for file upload
      const formDataForUpload = new FormData();
      formDataForUpload.append('bankSlip', bankSlip);
      
      let bankSlipUrl = '';
      try {
        console.log('Sending bank slip to server...');
        const uploadResponse = await axios.post(
          'http://localhost:5555/api/uploads/bank-slip', 
          formDataForUpload,
          { 
            headers: { 
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('Upload successful:', uploadResponse.data);
        // Use the full URL returned from the server
        bankSlipUrl = uploadResponse.data.fileUrl;
        
        if (!bankSlipUrl) {
          throw new Error('Server did not return a file URL');
        }
      } catch (uploadError) {
        console.error('Error uploading bank slip:', uploadError);
        
        if (uploadError.response) {
          console.error('Upload error details:', uploadError.response.data);
          throw new Error(uploadError.response.data.error || 'Failed to upload bank slip');
        } else {
          console.error('Network error during upload:', uploadError.message);
          throw new Error('Network error. Please check your connection and try again.');
        }
      } finally {
        setUploadLoading(false);
      }
      
      // Now process the payment with the bank slip URL
      console.log('Processing payment with bank slip URL:', bankSlipUrl);
      
      const paymentData = {
        p_amount: amount,
        p_description: formData.description || `Payment for event ${eventId}, package ${packageId}`,
        reference: formData.reference,
        bankSlipUrl: bankSlipUrl,  // Ensure URL is included
        customerId,
        eventId,
        packageId
      };
      
      console.log('Payment data being sent:', paymentData);
      
      const paymentResponse = await axios.post('http://localhost:5555/api/payments/portal', paymentData);
      
      console.log('Payment successful:', paymentResponse.data);
      enqueueSnackbar('Payment processed successfully!', { variant: 'success' });
      
      navigate('/payment/success', { 
        state: { 
          paymentId: paymentResponse.data.payment.P_ID,
          amount,
          eventId,
          packageId,
          paymentMethod: 'Payment Portal',
          reference: formData.reference
        } 
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      enqueueSnackbar(error.message || 'Failed to process payment. Please try again.', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Format reference number as user types (uppercase and no spaces)
  const handleReferenceChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/\s/g, '');
    setFormData(prev => ({
      ...prev,
      reference: value
    }));
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
            Payment Reference Number *
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
              onChange={handleReferenceChange}
              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Reference should be at least 6 characters (letters, numbers, hyphens allowed)</p>
        </div>

        <div>
          <label htmlFor="bankSlip" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Bank Slip *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            {!previewUrl ? (
              <div className="space-y-1 text-center">
                <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500">
                    <span>Upload a file</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      accept="image/*" 
                      className="sr-only" 
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            ) : (
              <div className="relative w-full">
                <img 
                  src={previewUrl} 
                  alt="Bank slip preview" 
                  className="mx-auto max-h-48 object-contain"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            maxLength={200}
          />
          <p className="mt-1 text-xs text-gray-500">{formData.description.length}/200 characters</p>
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
            disabled={loading || uploadLoading}
            className={`flex-grow px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${loading || uploadLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading || uploadLoading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </span>
            ) : (
              'Confirm Payment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortalPayment;
