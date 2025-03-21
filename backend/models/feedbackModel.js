import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
