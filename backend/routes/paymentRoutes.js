import express from 'express';
import Payment, { CardPayment, PortalPayment } from '../models/Payment.js';
import { Event } from '../models/eventModel.js';
import { Package } from '../models/packageModel.js';

const router = express.Router();

// Helper function to generate a unique payment ID
async function generatePaymentId() {
  try {
    const lastPayment = await Payment.findOne().sort({ P_ID: -1 });
    let newId;
    
    if (lastPayment) {
      // Extract the number part and increment it
      const lastIdNum = parseInt(lastPayment.P_ID.replace('PAY', ''));
      newId = `PAY${(lastIdNum + 1).toString().padStart(3, '0')}`;
    } else {
      // If no payments exist, start with PAY001
      newId = 'PAY001';
    }
    
    return newId;
  } catch (error) {
    console.error('Error generating payment ID:', error);
    throw error;
  }
}

// Create a Portal Payment
router.post('/portal', async (req, res) => {
  try {
    // Extract from body
    const { p_amount, p_description, reference, customerId, eventId, packageId } = req.body;
    
    // Validate the required fields
    if (!p_amount || !reference || !customerId || !eventId || !packageId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: 'p_amount, reference, customerId, eventId, packageId' 
      });
    }
    
    // Verify event exists
    const eventExists = await Event.findOne({ E_ID: eventId });
    if (!eventExists) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found` });
    }
    
    // Verify package exists
    const packageExists = await Package.findOne({ Pg_ID: packageId });
    if (!packageExists) {
      return res.status(404).json({ error: `Package with ID ${packageId} not found` });
    }

    // Generate a unique payment ID
    const P_ID = await generatePaymentId();

    // Create new PortalPayment
    const newPortalPayment = new PortalPayment({
      P_ID,
      p_amount,
      p_description,
      reference,
      customerId,
      eventId,
      packageId,
      status: 'confirmed'
    });
    
    const savedPayment = await newPortalPayment.save();
    
    res.status(201).json({
      message: 'Portal payment created successfully',
      payment: savedPayment
    });
  } catch (error) {
    console.error('Error creating portal payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a Card Payment
router.post('/card', async (req, res) => {
  try {
    const { 
      p_amount, c_type, c_description, cardNumber, cardholderName, 
      expiryDate, customerId, eventId, packageId 
    } = req.body;
    
    // Validate the required fields
    if (!p_amount || !c_type || !cardNumber || !cardholderName || 
        !expiryDate || !customerId || !eventId || !packageId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: 'p_amount, c_type, cardNumber, cardholderName, expiryDate, customerId, eventId, packageId'
      });
    }
    
    // Verify event exists
    const eventExists = await Event.findOne({ E_ID: eventId });
    if (!eventExists) {
      return res.status(404).json({ error: `Event with ID ${eventId} not found` });
    }
    
    // Verify package exists
    const packageExists = await Package.findOne({ Pg_ID: packageId });
    if (!packageExists) {
      return res.status(404).json({ error: `Package with ID ${packageId} not found` });
    }
    
    // Generate a unique payment ID
    const P_ID = await generatePaymentId();
    
    const newCardPayment = new CardPayment({
      P_ID,
      p_amount,
      c_type,
      c_description,
      cardNumber,
      cardholderName,
      expiryDate,
      customerId,
      eventId,
      packageId,
      status: 'confirmed'
    });
    
    const savedPayment = await newCardPayment.save();
    
    res.status(201).json({
      message: 'Card payment created successfully',
      payment: savedPayment
    });
  } catch (error) {
    console.error('Error creating card payment:', error);
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

// Get payments for a specific customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const payments = await Payment.find({ customerId });
    res.json(payments);
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
