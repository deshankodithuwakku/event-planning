import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CardPayment from '../../components/payment/CardPayment';
import PortalPayment from '../../components/payment/PortalPayment';
import { FaArrowLeft, FaCreditCard, FaWallet } from 'react-icons/fa';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, selectedPackage } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState(null); // 'card' or 'portal'

  // If no event or package data, redirect to events
  if (!event || !selectedPackage) {
    navigate('/events');
    return null;
  }

  const handleBackClick = () => {
    navigate(`/events/${event.E_ID}`);
  };

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBackClick}
          className="flex items-center text-sky-600 hover:text-sky-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Event Details
        </button>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-sky-800">Complete Your Payment</h1>
            <p className="text-sm text-gray-500 mt-1">Event: {event.E_name}</p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Summary</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Package:</span>
                  <span className="font-medium">{selectedPackage.Pg_ID}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-sky-700">
                  <span>Total:</span>
                  <span>${selectedPackage.Pg_price}</span>
                </div>
              </div>
            </div>

            {!paymentMethod ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition"
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FaCreditCard className="text-2xl mr-3 text-sky-600" />
                    <span className="font-medium">Credit Card</span>
                  </button>
                  <button
                    className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition"
                    onClick={() => setPaymentMethod('portal')}
                  >
                    <FaWallet className="text-2xl mr-3 text-sky-600" />
                    <span className="font-medium">Payment Portal</span>
                  </button>
                </div>
              </div>
            ) : paymentMethod === 'card' ? (
              <CardPayment 
                amount={selectedPackage.Pg_price} 
                eventId={event.E_ID} 
                packageId={selectedPackage.Pg_ID} 
                onCancel={() => setPaymentMethod(null)}
              />
            ) : (
              <PortalPayment 
                amount={selectedPackage.Pg_price} 
                eventId={event.E_ID} 
                packageId={selectedPackage.Pg_ID} 
                onCancel={() => setPaymentMethod(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
