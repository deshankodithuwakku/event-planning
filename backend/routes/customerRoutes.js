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

export default router;
