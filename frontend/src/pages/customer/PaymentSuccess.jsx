import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome } from 'react-icons/fa';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentDetails = location.state || {};

  // Generate a random booking number if we don't have one
  const bookingNumber = paymentDetails.paymentId || `BKG${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="mt-2 text-gray-600">
            Thank you for your payment. Your booking has been confirmed.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Booking Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Booking Number:</span>
              <span className="font-medium">{bookingNumber}</span>
            </div>
            {paymentDetails.eventId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Event ID:</span>
                <span className="font-medium">{paymentDetails.eventId}</span>
              </div>
            )}
            {paymentDetails.packageId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Package:</span>
                <span className="font-medium">{paymentDetails.packageId}</span>
              </div>
            )}
            {paymentDetails.amount && (
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-green-600">${paymentDetails.amount}</span>
              </div>
            )}
            {paymentDetails.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-medium">{paymentDetails.paymentMethod}</span>
              </div>
            )}
            {paymentDetails.paymentMethod === 'Credit Card' && paymentDetails.cardLast4 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Card:</span>
                <span className="font-medium">xxxx-xxxx-xxxx-{paymentDetails.cardLast4}</span>
              </div>
            )}
            {paymentDetails.paymentMethod === 'Payment Portal' && paymentDetails.reference && (
              <div className="flex justify-between">
                <span className="text-gray-500">Reference Number:</span>
                <span className="font-medium">{paymentDetails.reference}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            A confirmation email has been sent to your registered email address.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <FaHome className="mr-2" /> Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
