import mongoose from 'mongoose';
const { Schema } = mongoose;

// Base Payment Schema
const PaymentSchema = new Schema(
  {
    P_ID: {
        type: String,
        required: true,
        unique: true
    },
    
    p_date: {
      type: Date,
      required: true,
      default: Date.now
    },
    p_amount: {
      type: Number,
      required: true
    }
  },
  {
    // The 'discriminatorKey' tells Mongoose how to separate sub-documents.
    // They will share the same collection but have a key "kind" or "type"
    // to indicate which discriminator is used.
    discriminatorKey: 'paymentType',
    collection: 'payments', // ensures everything is stored in the same collection
  }
);

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;



