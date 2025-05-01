import express from 'express';
import Payment, { CardPayment, PortalPayment } from '../models/Payment.js';
import { Event } from '../models/eventModel.js';
import { Package } from '../models/packageModel.js';

const router = express.Router();

// Helper function to generate a unique payment ID
async function generatePaymentId() {
  try {
    // Get current timestamp for uniqueness
    const timestamp = Date.now();
    const randomComponent = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Try to find the last payment to maintain sequence if possible
    const lastPayment = await Payment.findOne().sort({ createdAt: -1 });
    
    if (lastPayment && lastPayment.P_ID) {
      // Extract the number part and increment it
      const matches = lastPayment.P_ID.match(/PAY(\d+)/);
      const lastIdNum = matches && matches[1] ? parseInt(matches[1], 10) : 0;
      
      if (!isNaN(lastIdNum)) {
        // Combine sequential number with random component
        const nextNum = lastIdNum + 1;
        return `PAY${nextNum}${randomComponent}`;
      }
    }
    
    // Default to timestamp-based ID if no valid previous ID or as fallback
    return `PAY${timestamp.toString().slice(-6)}${randomComponent}`;
  } catch (error) {
    console.error('Error generating payment ID:', error);
    // Fallback to guaranteed unique timestamp-based ID
    return `PAY${Date.now().toString().slice(-9)}`;
  }
}

// Create a Portal Payment
router.post('/portal', async (req, res) => {
  try {
    // Extract from body
    const { p_amount, p_description, reference, bankSlipUrl, customerId, eventId, packageId } = req.body;
    
    // Log the received data to debug
    console.log('Received payment data:', { p_amount, p_description, reference, bankSlipUrl, customerId, eventId, packageId });

    // Validate the required fields with explicit checks for bankSlipUrl
    if (!p_amount || !reference || !customerId || !eventId || !packageId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: 'p_amount, reference, customerId, eventId, packageId' 
      });
    }

    if (!bankSlipUrl) {
      return res.status(400).json({ 
        error: 'Bank slip URL is required but was not provided',
        received: req.body 
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

    let savedPayment = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    // Retry logic for handling potential ID conflicts
    while (!savedPayment && retryCount < maxRetries) {
      try {
        // Generate a unique payment ID with timestamp and random component
        const timestamp = Date.now();
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const P_ID = `PAY${timestamp.toString().slice(-6)}${randomPart}`;
        
        console.log(`Attempting to create payment with ID: ${P_ID} (Attempt ${retryCount + 1})`);
        console.log(`Bank slip URL being saved: ${bankSlipUrl}`);

        // Create new PortalPayment with explicit bankSlipUrl
        const newPortalPayment = new PortalPayment({
          P_ID,
          p_amount,
          p_description,
          reference,
          bankSlipUrl,  // Make sure this is properly assigned
          customerId,
          eventId,
          packageId,
          status: 'confirmed'
        });
        
        savedPayment = await newPortalPayment.save();
        console.log('Payment saved successfully with ID:', P_ID);
      } catch (saveError) {
        console.error('Save error:', saveError);
        retryCount++;
        if (saveError.code === 11000 && retryCount < maxRetries) {
          console.log(`Duplicate key error, retrying... (${retryCount}/${maxRetries})`);
        } else if (retryCount >= maxRetries) {
          throw new Error(`Failed to create payment after ${maxRetries} attempts: ${saveError.message}`);
        } else {
          throw saveError;
        }
      }
    }
    
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
    
    let savedPayment = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    // Retry logic for handling potential ID conflicts
    while (!savedPayment && retryCount < maxRetries) {
      try {
        // Generate a unique payment ID
        const P_ID = await generatePaymentId();
        console.log(`Attempting to create card payment with ID: ${P_ID} (Attempt ${retryCount + 1})`);
        
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
        
        savedPayment = await newCardPayment.save();
      } catch (saveError) {
        retryCount++;
        if (saveError.code === 11000 && retryCount < maxRetries) {
          console.log(`Duplicate key error, retrying... (${retryCount}/${maxRetries})`);
        } else if (retryCount >= maxRetries) {
          throw new Error(`Failed to create payment after ${maxRetries} attempts: ${saveError.message}`);
        } else {
          throw saveError;
        }
      }
    }
    
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
    console.log(`Fetching payments for customer with ID: ${customerId}`);
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
    
    const payments = await Payment.find({ customerId });
    console.log(`Found ${payments.length} payments for customer ${customerId}`);
    
    // Return the payments
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payments for the logged-in customer
router.get('/customer/my-payments', async (req, res) => {
  try {
    // Get customer ID from query params
    const { customerId } = req.query;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
    
    console.log(`Fetching payments for customer ID: ${customerId}`);
    
    const payments = await Payment.find({ customerId });
    console.log(`Found ${payments.length} payments for customer ${customerId}`);
    
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Allow customer to cancel their payment
router.patch('/customer/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
    
    // Find the payment and check if it belongs to the customer
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Verify ownership
    if (payment.customerId !== customerId) {
      return res.status(403).json({ error: 'Unauthorized: This payment does not belong to you' });
    }
    
    // Only allow cancellation if payment status is not already cancelled/refunded
    if (['cancelled', 'refunded'].includes(payment.status)) {
      return res.status(400).json({ error: `Payment is already ${payment.status}` });
    }
    
    // Update status
    payment.status = 'cancelled';
    await payment.save();
    
    res.json({ 
      message: 'Payment cancelled successfully',
      payment: payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Allow admin to refund a payment - with improved error handling
router.patch('/admin/refund/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Processing refund request for payment ID: ${id}`);
    
    // Find the payment - try both MongoDB _id and P_ID fields
    let payment = await Payment.findById(id);
    
    // If not found by _id, try finding by P_ID
    if (!payment) {
      payment = await Payment.findOne({ P_ID: id });
    }
    
    // If still not found
    if (!payment) {
      console.log(`Payment not found with ID: ${id}`);
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    console.log(`Payment found: ${payment.P_ID}, status: ${payment.status}`);
    
    // Only allow refund if payment status is "confirmed"
    if (payment.status !== 'confirmed') {
      console.log(`Cannot refund payment with status: ${payment.status}`);
      return res.status(400).json({ error: `Cannot refund a payment that is already ${payment.status}` });
    }
    
    // Update status
    payment.status = 'refunded';
    await payment.save();
    console.log(`Payment ${payment.P_ID} successfully refunded`);
    
    res.json({ 
      message: 'Payment refunded successfully',
      payment: payment
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ error: error.message || 'Internal server error during refund process' });
  }
});

// Update a payment record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { p_amount, p_description, c_description, bankSlipUrl } = req.body;
    
    console.log('Update payment request:', req.body);
    
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
      const updateFields = { p_amount, p_description };
      
      // Only include bankSlipUrl in update if it's explicitly provided in request
      // This allows both updating and removing the bank slip
      if (bankSlipUrl !== undefined) {
        updateFields.bankSlipUrl = bankSlipUrl;
      }
      
      const updatedPayment = await PortalPayment.findByIdAndUpdate(
        id,
        updateFields,
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
    console.error('Error updating payment:', error);
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
