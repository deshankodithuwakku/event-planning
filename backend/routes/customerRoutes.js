import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  loginCustomer,
  generateCustomerId
} from '../controllers/customerController.js';
import Payment from '../models/Payment.js';
import { Event } from '../models/eventModel.js';
import { Package } from '../models/packageModel.js';
import mongoose from 'mongoose';

const router = express.Router();

// Generate unique ID route
router.get('/generate-id', generateCustomerId);

// CRUD operations
router.post('/', createCustomer);
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Authentication route
router.post('/login', loginCustomer);

// Get customer's events and payments
router.get('/:customerId/events', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    console.log(`Fetching events for customer: ${customerId}`);
    
    // Find all payments made by this customer
    const payments = await Payment.find({ customerId }).sort({ p_date: -1 });
    console.log(`Found ${payments.length} payments`);
    
    // Create an array to store the complete event data
    const customerEvents = [];
    
    // For each payment, fetch the associated event and package details
    for (const payment of payments) {
      console.log(`Processing payment: ${payment.P_ID}, eventId: ${payment.eventId}, packageId: ${payment.packageId}`);
      
      // Get event details
      const event = await Event.findOne({ E_ID: payment.eventId });
      
      // Get package details
      const package_ = await Package.findOne({ Pg_ID: payment.packageId });
      
      console.log(`Event found: ${!!event}, Package found: ${!!package_}`);
      
      // Only include if both event and package exist
      if (event && package_) {
        customerEvents.push({
          payment: {
            _id: payment._id,
            P_ID: payment.P_ID,
            amount: payment.p_amount,
            date: payment.p_date,
            status: payment.status,
            paymentType: payment.paymentType,
            description: payment.paymentType === 'Card' ? payment.c_description : payment.p_description,
            reference: payment.paymentType === 'Portal' ? payment.reference : null,
            bankSlipUrl: payment.paymentType === 'Portal' ? payment.bankSlipUrl : null,
            cardDetails: payment.paymentType === 'Card' ? {
              cardNumber: payment.cardNumber,
              cardholderName: payment.cardholderName
            } : null
          },
          event: {
            E_ID: event.E_ID,
            E_name: event.E_name,
            date: event.date,
            location: event.location,
            status: event.status
          },
          package: {
            Pg_ID: package_.Pg_ID,
            Pg_price: package_.Pg_price,
            Pg_description: package_.Pg_description
          }
        });
      }
    }
    
    res.status(200).json({
      count: customerEvents.length,
      data: customerEvents
    });
    
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
});

export default router;
