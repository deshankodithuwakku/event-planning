import mongoose from 'mongoose';
import { Feedback } from '../models/feedbackModel.js';

export const createFeedback = async (req, res) => {
  try {
    const { message, customerId, rating } = req.body;
    
    if (!customerId) {
      return res.status(401).json({ 
        message: 'User authentication required', 
        status: 'error' 
      });
    }
    
    const feedback = new Feedback({ 
      message, 
      customerId, 
      rating: rating || 5 
    });
    
    await feedback.save();
    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback, 
      status: 'success' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to submit feedback', 
      error: error.message, 
      status: 'error' 
    });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch feedbacks', 
      error: error.message,
      status: 'error' 
    });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid feedback ID format',
        status: 'error' 
      });
    }

    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({ 
        message: 'Feedback not found',
        status: 'error'
      });
    }

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error in getFeedback:', error);
    res.status(500).json({ 
      message: 'Failed to fetch feedback',
      error: error.message,
      status: 'error'
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(401).json({ 
        message: 'User authentication required',
        status: 'error' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid feedback ID format',
        status: 'error' 
      });
    }

    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({ 
        message: 'Feedback not found',
        status: 'error'
      });
    }
    
    // Check if current user is the owner of this feedback
    if (feedback.customerId !== customerId) {
      return res.status(403).json({ 
        message: 'You can only delete your own feedback', 
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

export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, customerId, rating } = req.body;
    
    if (!customerId) {
      return res.status(401).json({ 
        message: 'User authentication required',
        status: 'error' 
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid feedback ID format',
        status: 'error' 
      });
    }
    
    // Find feedback and check ownership
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({ 
        message: 'Feedback not found',
        status: 'error'
      });
    }
    
    // Check if current user is the owner of this feedback
    if (feedback.customerId !== customerId) {
      return res.status(403).json({ 
        message: 'You can only edit your own feedback', 
        status: 'error' 
      });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { message, rating },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: 'Feedback updated successfully',
      status: 'success',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Error in updateFeedback:', error);
    res.status(500).json({ 
      message: 'Error updating feedback',
      error: error.message,
      status: 'error'
    });
  }
};
