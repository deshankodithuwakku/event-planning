import express from 'express';
import { createFeedback, getFeedbacks, deleteFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', getFeedbacks);
router.delete('/:id', deleteFeedback);

export default router;
