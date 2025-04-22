import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  customerId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  }
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
