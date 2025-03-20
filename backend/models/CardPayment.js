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
  }
});

// Create a discriminator model
const CardPayment = Payment.discriminator('Card', CardPaymentSchema);

export default CardPayment;
