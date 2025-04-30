import { User } from '../models/userModel.js';
import { Feedback } from '../models/feedbackModel.js';
import Payment from '../models/Payment.js';
import mongoose from 'mongoose';
import { generateToken } from '../utils/jwtUtils.js';
import bcrypt from 'bcrypt';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Get customers only
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' });
    return res.status(200).json({
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

/**
 * Get all admin users
 */
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    return res.status(200).json({
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const { userId, firstName, lastName, userName, password, phoneNo } = req.body;
    
    if (!userId || !firstName || !lastName || !userName || !password || !phoneNo) {
      return res.status(400).send({
        message: 'All fields are required: userId, firstName, lastName, userName, password, phoneNo',
      });
    }

    // Check if we already have the User model available
    try {
      // Create new customer with role
      const customer = new User({
        userId,
        firstName,
        lastName,
        userName,
        password,
        phoneNo,
        role: 'customer'
      });

      const savedCustomer = await customer.save();
      return res.status(201).send(savedCustomer);
    } catch (modelError) {
      // If the User model is not available, fall back to the Customer model
      console.log('Falling back to Customer model', modelError);
      
      // Handle the old schema by remapping fields
      const newCustomer = {
        C_ID: userId,
        firstName,
        lastName,
        userName,
        password,
        phoneNo,
      };

      const { Customer } = await import('../models/customerModel.js');
      const customer = await Customer.create(newCustomer);
      return res.status(201).send(customer);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

/**
 * Create a new admin user
 */
export const createAdmin = async (req, res) => {
  try {
    const { userId, userName, password, phoneNo } = req.body;
    
    if (!userId || !userName || !password || !phoneNo) {
      return res.status(400).send({
        message: 'All fields are required: userId, userName, password, phoneNo',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { userId },
        { userName }
      ]
    });

    if (existingUser) {
      return res.status(400).send({
        message: 'User ID or username already exists',
      });
    }

    // Create new admin with role
    const admin = new User({
      userId,
      userName,
      password, // This will be hashed in the pre-save hook
      phoneNo,
      role: 'admin'
    });

    const savedAdmin = await admin.save();
    
    return res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        userId: savedAdmin.userId,
        userName: savedAdmin.userName,
        phoneNo: savedAdmin.phoneNo,
        role: savedAdmin.role
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Handle legacy 'name' field conversion to firstName/lastName
    if (updateData.name && !updateData.firstName && !updateData.lastName) {
      const nameParts = updateData.name.trim().split(' ');
      updateData.firstName = nameParts[0] || '';
      updateData.lastName = nameParts.slice(1).join(' ') || '';
      delete updateData.name; // Remove name field as we're using firstName/lastName
    }
    
    const result = await User.findOneAndUpdate(
      { userId: id },
      updateData,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).send({ 
      message: 'User updated successfully', 
      data: {
        userId: result.userId,
        firstName: result.firstName,
        lastName: result.lastName,
        userName: result.userName,
        phoneNo: result.phoneNo,
        role: result.role,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      } 
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

/**
 * Update admin user
 */
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, password, phoneNo } = req.body;
    
    const updateData = {};
    if (userName) updateData.userName = userName;
    if (password) updateData.password = password; // Will be hashed in pre-save hook
    if (phoneNo) updateData.phoneNo = phoneNo;
    
    const result = await User.findOneAndUpdate(
      { userId: id, role: 'admin' },
      updateData,
      { new: true }
    ).select('-password');

    if (!result) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(200).json({
      message: 'Admin updated successfully',
      data: result
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Delete a user and all related records
export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Find the user to make sure they exist
    const user = await User.findOne({ userId: id }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related records based on role
    if (user.role === 'customer') {
      // Delete feedback records
      const deletedFeedback = await Feedback.deleteMany({ 
        customerId: id 
      }).session(session);
      
      // Potentially delete payment records
      // const deletedPayments = await Payment.deleteMany({ customerId: id }).session(session);
    }

    // Delete the user
    const result = await User.findOneAndDelete({ userId: id }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ 
      message: 'User and all related records deleted successfully',
      deletedUser: result
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

/**
 * Delete admin user
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await User.findOneAndDelete({ 
      userId: id,
      role: 'admin'
    });

    if (!result) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(200).json({ 
      message: 'Admin deleted successfully',
      data: {
        userId: result.userId,
        userName: result.userName
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Generate a unique user ID (for customers)
export const generateCustomerId = async (req, res) => {
  try {
    // Find the user with the highest customer ID
    const lastCustomer = await User.findOne({ role: 'customer' }).sort({ userId: -1 });
    
    let newId;
    if (lastCustomer) {
      // Extract the number part and increment it
      const lastIdNum = parseInt(lastCustomer.userId.replace('CUS', ''));
      newId = `CUS${(lastIdNum + 1).toString().padStart(2, '0')}`;
    } else {
      // If no customers exist, start with CUS01
      newId = 'CUS01';
    }
    
    return res.status(200).json({ id: newId });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

/**
 * Generate a unique admin ID
 */
export const generateAdminId = async (req, res) => {
  try {
    const lastAdmin = await User.findOne({ role: 'admin' }).sort({ userId: -1 });
    
    let newId;
    if (lastAdmin) {
      // Extract the number part and increment it
      const lastIdNum = parseInt(lastAdmin.userId.replace('AD', ''));
      newId = `AD${(lastIdNum + 1).toString().padStart(2, '0')}`;
    } else {
      // If no admins exist, start with AD01
      newId = 'AD01';
    }
    
    return res.status(200).json({ id: newId });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

/**
 * Get admin user by ID
 */
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findOne({ 
      userId: id,
      role: 'admin' 
    }).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};
