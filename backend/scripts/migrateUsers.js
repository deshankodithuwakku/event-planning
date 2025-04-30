import mongoose from 'mongoose';
import { Customer } from '../models/customerModel.js';
import { Admin } from '../models/adminModel.js';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/**
 * Migrate customers and admins to the new User model
 */
const migrateUsers = async () => {
  try {
    console.log('Starting migration...');
    
    // Migrate customers
    console.log('Migrating customers...');
    const customers = await Customer.find({});
    console.log(`Found ${customers.length} customers to migrate`);
    
    for (const customer of customers) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ userId: customer.C_ID }, { userName: customer.userName }] 
      });
      
      if (!existingUser) {
        const user = new User({
          userId: customer.C_ID,
          firstName: customer.firstName,
          lastName: customer.lastName,
          userName: customer.userName,
          password: customer.password, // This will be hashed on save
          phoneNo: customer.phoneNo,
          role: 'customer'
        });
        
        await user.save();
        console.log(`Migrated customer ${customer.C_ID}`);
      } else {
        console.log(`Customer ${customer.C_ID} already migrated, skipping`);
      }
    }
    
    // Migrate admins
    console.log('Migrating admins...');
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admins to migrate`);
    
    for (const admin of admins) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ userId: admin.A_ID }, { userName: admin.userName }] 
      });
      
      if (!existingUser) {
        const user = new User({
          userId: admin.A_ID,
          userName: admin.userName,
          password: admin.password, // This will be hashed on save
          phoneNo: admin.phoneNo,
          role: 'admin'
        });
        
        await user.save();
        console.log(`Migrated admin ${admin.A_ID}`);
      } else {
        console.log(`Admin ${admin.A_ID} already migrated, skipping`);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

migrateUsers();
