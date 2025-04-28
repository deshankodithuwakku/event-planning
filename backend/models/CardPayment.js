import mongoose from 'mongoose';
import Payment from './Payment.js';
const { Schema } = mongoose;

// Define the extra fields for "Card"
const CardPaymentSchema = new Schema({
  c_type: {
    type: String,
    required: true
  },
  c_description: {
    type: String,
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    // Store only the last 4 digits for security
    set: function(value) {
      const lastFourDigits = value.replace(/\D/g, '').slice(-4);
      return `xxxx-xxxx-xxxx-${lastFourDigits}`;
    }
  },
  cardholderName: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  }
});

// Create a discriminator model
const CardPayment = Payment.discriminator('Card', CardPaymentSchema);

export default CardPayment;
