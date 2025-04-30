import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from '../models/adminModel.js';
import { User } from '../models/userModel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://2003thanuka:mGRAi0dEZvFnn1pV@cluster0.zculr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to database'))
  .catch(err => {
    console.error('Connection error', err);
    process.exit(1);
  });

const migrateAdmins = async () => {
  try {
    console.log('Starting admin migration...');
    
    // Get all admins
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admins to migrate`);
    
    // For each admin, create or update a user record
    for (const admin of admins) {
      // Check if user already exists with this ID or username
      const existingUser = await User.findOne({
        $or: [
          { userId: admin.A_ID },
          { userName: admin.userName }
        ]
      });
      
      if (!existingUser) {
        // Create new user with admin role
        const newUser = new User({
          userId: admin.A_ID,
          userName: admin.userName,
          password: admin.password,
          phoneNo: admin.phoneNo,
          role: 'admin'
        });
        
        await newUser.save();
        console.log(`Migrated admin ${admin.A_ID} to user model`);
      } else {
        console.log(`User already exists for admin ${admin.A_ID} - skipping`);
      }
    }
    
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

migrateAdmins();
