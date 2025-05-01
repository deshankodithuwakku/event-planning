import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import customerRoutes from './routes/customerRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Add this import

// Import the controller
import { getCustomerPurchases } from './controllers/purchaseController.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize environment variables
dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const bankSlipsDir = path.join(uploadsDir, 'bank-slips');

if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(bankSlipsDir)) {
  console.log('Creating bank-slips directory...');
  fs.mkdirSync(bankSlipsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); // Add this line
app.use('/api/customers', customerRoutes); // Keep for backward compatibility
app.use('/api/events', eventRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admins', adminRoutes);

// Direct endpoint for development - bypassing auth for customer purchases
app.get('/api/customer-purchases', getCustomerPurchases);

// Root route
app.get('/', (req, res) => {
  return res.status(200).send('Welcome to the Event Planning API');
});

// MongoDB connection and server start
const PORT = process.env.PORT || 5555;
const mongoDBURL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/event-planning';

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log('App connected to database');
    app.listen(PORT, () => {
      console.log(`App is listening on port: ${PORT}`);
      console.log(`File uploads configured and ready`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
