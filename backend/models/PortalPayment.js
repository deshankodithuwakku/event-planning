import mongoose from 'mongoose';
import Payment from './Payment.js';
const { Schema } = mongoose;

// Define the extra fields for "Portal"
const PortalPaymentSchema = new Schema({
  p_description: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true
  }
});

// Create a discriminator model
const PortalPayment = Payment.discriminator('Portal', PortalPaymentSchema);

export default PortalPayment;
