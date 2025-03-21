import express from 'express';
import { createFeedback, getFeedbacks, getFeedback, updateFeedback, deleteFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', getFeedbacks);
router.get('/:id', getFeedback);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export default router;
