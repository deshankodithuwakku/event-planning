import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { getImageUrl } from '../../utils/urlHelper';

const EditPayment = ({ payment, onClose, onSave }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    p_amount: payment.p_amount,
    description: payment.paymentType === 'Card' ? payment.c_description : payment.p_description
  });
  const [bankSlip, setBankSlip] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usingOriginalSlip, setUsingOriginalSlip] = useState(!!payment.bankSlipUrl);
  
  // Initialize the preview URL from the existing bank slip
  useEffect(() => {
    if (payment.bankSlipUrl) {
      setPreviewUrl(getImageUrl(payment.bankSlipUrl));
    }
  }, [payment.bankSlipUrl]);
  
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

    // Set the new file and preview
    setBankSlip(file);
    
    // Revoke previous object URL to avoid memory leaks
    if (previewUrl && !usingOriginalSlip) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Create new preview URL and mark as not using original slip
    setPreviewUrl(URL.createObjectURL(file));
    setUsingOriginalSlip(false);
  };

  const removeFile = () => {
    // If there's a new bank slip, clean up its object URL
    if (bankSlip) {
      setBankSlip(null);
      if (!usingOriginalSlip && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
    
    // Clear the preview and mark that we're not using the original image
    setPreviewUrl('');
    setUsingOriginalSlip(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const updatedPayment = {
        ...payment,
        p_amount: parseFloat(formData.p_amount)
      };
      
      // Update the appropriate description field based on payment type
      if (payment.paymentType === 'Card') {
        updatedPayment.c_description = formData.description;
      } else {
        updatedPayment.p_description = formData.description;
      }
      
      // If there's a new bank slip and it's a Portal payment, upload it
      if (bankSlip && payment.paymentType === 'Portal') {
        setUploadLoading(true);
        
        // Create form data for file upload
        const formDataForUpload = new FormData();
        formDataForUpload.append('bankSlip', bankSlip);
        
        try {
          const uploadResponse = await axios.post(
            'http://localhost:5555/api/uploads/bank-slip', 
            formDataForUpload,
            { 
              headers: { 
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (uploadResponse.data && uploadResponse.data.fileUrl) {
            updatedPayment.bankSlipUrl = uploadResponse.data.fileUrl;
          } else {
            throw new Error('Failed to get uploaded file URL');
          }
        } catch (error) {
          enqueueSnackbar('Failed to upload new bank slip', { variant: 'error' });
          setSubmitting(false);
          setUploadLoading(false);
          return;
        } finally {
          setUploadLoading(false);
        }
      } else if (!usingOriginalSlip && payment.paymentType === 'Portal') {
        // If user removed the bank slip
        updatedPayment.bankSlipUrl = '';
      }
      
      onSave(updatedPayment);
    } catch (error) {
      enqueueSnackbar('Failed to update payment', { variant: 'error' });
      setSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-800">Edit Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment ID
            </label>
            <input
              type="text"
              value={payment.P_ID}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <input
              type="text"
              value={payment.paymentType}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="p_amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              id="p_amount"
              name="p_amount"
              value={formData.p_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              maxLength="200"
            ></textarea>
            <p className="mt-1 text-xs text-gray-500">{formData.description?.length || 0}/200 characters</p>
          </div>
          
          {/* Bank slip upload section - only for Portal payments */}
          {payment.paymentType === 'Portal' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Slip
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {!previewUrl ? (
                  <div className="space-y-1 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
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
              <p className="mt-1 text-xs text-gray-500">
                {payment.bankSlipUrl ? 'Upload a new bank slip to replace the current one' : 'Upload a bank slip as proof of payment'}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadLoading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                (submitting || uploadLoading) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting || uploadLoading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" /> Processing...
                </span>
              ) : (
                <><FaSave className="inline mr-1" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPayment;
