import express from 'express';
import {
  getAllUsers,
  getAllCustomers,
  getAllAdmins,
  getUserById,
  getAdminById,
  createCustomer,
  createAdmin,
  updateUser,
  updateAdmin,
  deleteUser,
  deleteAdmin,
  generateCustomerId,
  generateAdminId
} from '../controllers/userController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import Payment from '../models/Payment.js';
import { Event } from '../models/eventModel.js';
import { Package } from '../models/packageModel.js';

const router = express.Router();

// Public routes - make sure these are before the authenticate middleware
router.get('/generate-customer-id', generateCustomerId);
router.get('/generate-admin-id', generateAdminId);
router.post('/customer', createCustomer);

// Protected routes
router.get('/', authenticate, isAdmin, getAllUsers);
router.get('/customers', authenticate, isAdmin, getAllCustomers);
router.get('/admins', authenticate, isAdmin, getAllAdmins);
router.get('/:id', authenticate, getUserById);
router.get('/admins/:id', authenticate, isAdmin, getAdminById);
router.post('/admin', authenticate, isAdmin, createAdmin);
router.put('/:id', authenticate, updateUser);
router.put('/admins/:id', authenticate, isAdmin, updateAdmin);
router.delete('/:id', authenticate, isAdmin, deleteUser);
router.delete('/admins/:id', authenticate, isAdmin, deleteAdmin);

// Get customer's events and payments
router.get('/:userId/events', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Fetching events for user: ${userId}`);
    
    // Find all payments made by this customer
    const payments = await Payment.find({ customerId: userId }).sort({ p_date: -1 });
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
            Pg_price: package_.Pg_price
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

// Add a debugging endpoint
router.get('/debug', (req, res) => {
  res.status(200).json({ 
    message: 'User routes are working', 
    endpoints: {
      getCustomerId: '/api/users/generate-customer-id',
      createCustomer: '/api/users/customer [POST]',
      getAllUsers: '/api/users',
    }
  });
});

export default router;
