import { Feedback } from '../models/feedbackModel.js';

export const createFeedback = async (req, res) => {
  try {
    const { message, name } = req.body;
    const feedback = new Feedback({ message, name });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedbacks', error });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ 
        message: 'Feedback ID is required',
        status: 'error' 
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ 
        message: 'Feedback not found',
        status: 'error'
      });
    }

    await feedback.deleteOne();
    
    res.status(200).json({ 
      message: 'Feedback deleted successfully',
      status: 'success' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting feedback',
      error: error.message,
      status: 'error'
    });
  }
};
