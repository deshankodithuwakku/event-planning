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
import { Feedback } from '../models/feedbackModel.js';
import { User } from '../models/userModel.js';
import { getCustomerPurchases } from '../controllers/purchaseController.js';

const router = express.Router();

// Public routes - make sure these are before the authenticate middleware
router.get('/generate-customer-id', generateCustomerId);
router.get('/generate-admin-id', generateAdminId);
router.post('/customer', createCustomer);

// Make sure this route is accessible without authentication for backward compatibility
router.put('/:id', updateUser);

// Protected routes - For fetching all users, ensure proper authentication
router.get('/', authenticate, isAdmin, getAllUsers);
router.get('/customers', authenticate, isAdmin, getAllCustomers);
router.get('/admins', authenticate, isAdmin, getAllAdmins);
router.get('/:id', authenticate, getUserById);
router.get('/admins/:id', authenticate, isAdmin, getAdminById);
router.post('/admin', authenticate, isAdmin, createAdmin);
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

// Get customers with their purchased events, payments, and feedback
router.get('/customers/purchases', getCustomerPurchases);

// Get user profile (migration friendly endpoint)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to find in User model first (new model)
    let user = await User.findOne({ userId }).select('-password');
    
    if (!user) {
      // If not found, try in Customer model (old model)
      const { Customer } = await import('../models/customerModel.js');
      const customer = await Customer.findOne({ C_ID: userId }).select('-password');
      
      if (!customer) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Map customer model to unified format
      return res.status(200).json({
        userId: customer.C_ID,
        C_ID: customer.C_ID,
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: `${customer.firstName} ${customer.lastName}`,
        userName: customer.userName,
        phoneNo: customer.phoneNo,
        role: 'customer',
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      });
    }
    
    // Format response based on user role
    if (user.role === 'customer') {
      return res.status(200).json({
        userId: user.userId,
        C_ID: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        userName: user.userName,
        phoneNo: user.phoneNo,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } else {
      return res.status(200).json({
        userId: user.userId,
        A_ID: user.userId,
        userName: user.userName,
        phoneNo: user.phoneNo,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    }
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
