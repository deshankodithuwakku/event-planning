import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FaCreditCard, FaUser, FaCalendarAlt, FaLock } from 'react-icons/fa';

const CardPayment = ({ amount, eventId, packageId, onCancel }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  // Add error state for real-time validation
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Validation functions
  const validateCardNumber = (value) => {
    const cardNumberRegex = /^[\d\s-]{15,19}$/;
    const cardNumberNoSpace = value.replace(/[\s-]/g, '');
    if (!value) return '';
    if (!cardNumberRegex.test(value) || cardNumberNoSpace.length < 15) {
      return 'Please enter a valid card number';
    }
    return '';
  };

  const validateCardName = (value) => {
    if (!value) return '';
    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(value)) {
      return 'Please enter a valid cardholder name';
    }
    return '';
  };

  const validateExpiryDate = (value) => {
    if (!value) return '';
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(value)) {
      return 'Please enter a valid expiry date (MM/YY)';
    }
    
    // Check if card is expired
    const [month, year] = value.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    if (expiryDate < currentDate) {
      return 'The card has expired';
    }
    return '';
  };

  const validateCVV = (value) => {
    if (!value) return '';
    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(value)) {
      return 'Please enter a valid CVV (3-4 digits)';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate in real-time
    if (name === 'cardName') {
      setErrors(prev => ({
        ...prev,
        cardName: validateCardName(value)
      }));
    }
  };

  const validateForm = () => {
    const cardNumberError = validateCardNumber(formData.cardNumber);
    const cardNameError = validateCardName(formData.cardName);
    const expiryDateError = validateExpiryDate(formData.expiryDate);
    const cvvError = validateCVV(formData.cvv);
    
    setErrors({
      cardNumber: cardNumberError,
      cardName: cardNameError,
      expiryDate: expiryDateError,
      cvv: cvvError
    });
    
    return !(cardNumberError || cardNameError || expiryDateError || cvvError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run full validation check
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Send payment data to backend
      const response = await axios.post('http://localhost:5555/api/payments/card', {
        p_amount: amount,
        c_type: 'Credit Card',
        c_description: `Payment for event ${eventId}, package ${packageId}`
      });
      
      enqueueSnackbar('Payment processed successfully!', { variant: 'success' });
      
      // Navigate to success page with payment details
      navigate('/payment/success', { 
        state: { 
          paymentId: response.data._id,
          amount,
          eventId,
          packageId,
          paymentMethod: 'Credit Card'
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

  // Format card number with spaces as user types
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    // Insert space after every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 chars (16 digits + 3 spaces)
    value = value.substring(0, 19);
    
    setFormData(prev => ({
      ...prev,
      cardNumber: value
    }));
    
    // Add real-time validation
    setErrors(prev => ({
      ...prev,
      cardNumber: validateCardNumber(value)
    }));
  };

  // Format expiry date as MM/YY as user types
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setFormData(prev => ({
      ...prev,
      expiryDate: value
    }));
    
    // Add real-time validation
    setErrors(prev => ({
      ...prev,
      expiryDate: validateExpiryDate(value)
    }));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-sky-700 mb-4">Credit Card Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCreditCard className="text-gray-400" />
            </div>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              className={`pl-10 block w-full px-3 py-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
              maxLength="19"
            />
          </div>
          {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
        </div>

        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              type="text"
              id="cardName"
              name="cardName"
              placeholder="John Doe"
              value={formData.cardName}
              onChange={handleChange}
              className={`pl-10 block w-full px-3 py-2 border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
            />
          </div>
          {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleExpiryDateChange}
                className={`pl-10 block w-full px-3 py-2 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                maxLength="5"
              />
            </div>
            {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
          </div>
          
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="text"
                id="cvv"
                name="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData(prev => ({ ...prev, cvv: value }));
                  setErrors(prev => ({
                    ...prev,
                    cvv: validateCVV(value)
                  }));
                }}
                className={`pl-10 block w-full px-3 py-2 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                maxLength="4"
              />
            </div>
            {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
          </div>
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
            {loading ? 'Processing...' : `Pay $${amount}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardPayment;
