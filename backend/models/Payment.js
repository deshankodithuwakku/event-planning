import mongoose from 'mongoose';
const { Schema } = mongoose;

// Base Payment Schema
const paymentSchema = new Schema({
  P_ID: {
    type: String,
    required: true,
    unique: true
  },
  p_amount: {
    type: Number,
    required: true
  },
  p_date: {
    type: Date,
    default: Date.now
  },
  customerId: {
    type: String,
    required: true,
    ref: 'Customer'
  },
  eventId: {
    type: String,
    required: true,
    ref: 'Event'
  },
  packageId: {
    type: String,
    required: true,
    ref: 'Package'
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'refunded', 'cancelled'],
    default: 'confirmed'
  }
}, {
  discriminatorKey: 'paymentType',
  timestamps: true
});

// Create the base model
const Payment = mongoose.model('Payment', paymentSchema);

// Card Payment Model
export const CardPayment = Payment.discriminator('Card', new Schema({
  c_type: {
    type: String,
    required: true
  },
  c_description: {
    type: String
  },
  cardNumber: {
    type: String,
    required: true
  },
  cardholderName: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  }
}));

// Portal Payment Model
export const PortalPayment = Payment.discriminator('Portal', new Schema({
  p_description: {
    type: String
  },
  reference: {
    type: String,
    required: true
  },
  bankSlipUrl: {
    type: String,
    required: true
  }
}));

export default Payment;



