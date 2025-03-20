import express from 'express';
const router = express.Router();

import Payment from '../models/Payment.js';
import PortalPayment from '../models/PortalPayment.js';
import CardPayment from '../models/CardPayment.js';

// Utility function to generate a unique payment ID
async function generatePaymentId() {
  // Find the payment with the highest ID
  const lastPayment = await Payment.findOne().sort({ P_ID: -1 });
  
  let newId;
  if (lastPayment) {
    // Extract the number part and increment it
    const lastIdNum = parseInt(lastPayment.P_ID.replace('PMT', ''));
    newId = `PMT${(lastIdNum + 1).toString().padStart(4, '0')}`;
  } else {
    // If no payments exist, start with PMT0001
    newId = 'PMT0001';
  }
  
  return newId;
}

// Create a Portal Payment
router.post('/portal', async (req, res) => {
  try {
    // Extract from body
    const { p_amount, p_description } = req.body;

    // Generate a unique payment ID
    const P_ID = await generatePaymentId();

    // Create new PortalPayment
    const newPortalPayment = new PortalPayment({
      P_ID,
      p_amount,
      p_description
    });
    const savedPayment = await newPortalPayment.save();
    res.json(savedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a Card Payment
router.post('/card', async (req, res) => {
  try {
    const { p_amount, c_type, c_description } = req.body;
    
    // Generate a unique payment ID
    const P_ID = await generatePaymentId();
    
    const newCardPayment = new CardPayment({
      P_ID,
      p_amount,
      c_type,
      c_description
    });
    const savedPayment = await newCardPayment.save();
    res.json(savedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
// Retrieve all payments (both Portal and Card)
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Or retrieve specifically by type
router.get('/portal', async (req, res) => {
  try {
    const portalPayments = await PortalPayment.find();
    res.json(portalPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/card', async (req, res) => {
  try {
    const cardPayments = await CardPayment.find();
    res.json(cardPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
