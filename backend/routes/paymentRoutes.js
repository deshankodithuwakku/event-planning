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

// Update a payment record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { p_amount, p_description, c_description } = req.body;
    
    // Find the payment to determine its type
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update fields based on payment type
    if (payment.paymentType === 'Card') {
      const updatedPayment = await CardPayment.findByIdAndUpdate(
        id,
        { p_amount, c_description },
        { new: true }
      );
      res.json(updatedPayment);
    } else if (payment.paymentType === 'Portal') {
      const updatedPayment = await PortalPayment.findByIdAndUpdate(
        id,
        { p_amount, p_description },
        { new: true }
      );
      res.json(updatedPayment);
    } else {
      // Generic payment update (base fields only)
      const updatedPayment = await Payment.findByIdAndUpdate(
        id,
        { p_amount },
        { new: true }
      );
      res.json(updatedPayment);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a payment record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({ message: 'Payment record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
