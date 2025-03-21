import { Feedback } from '../models/feedbackModel.js';

export const createFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    const feedback = new Feedback({ message });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error });
  }
};
