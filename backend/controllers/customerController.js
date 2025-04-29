import { Customer } from '../models/customerModel.js';
import { Feedback } from '../models/feedbackModel.js';
import Payment from '../models/Payment.js';
import mongoose from 'mongoose';

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({});
    return res.status(200).json({
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Get a single customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findOne({ C_ID: id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(customer);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    if (
      !req.body.C_ID ||
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.userName ||
      !req.body.password ||
      !req.body.phoneNo
    ) {
      return res.status(400).send({
        message: 'All fields are required: C_ID, firstName, lastName, userName, password, phoneNo',
      });
    }

    const newCustomer = {
      C_ID: req.body.C_ID,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      password: req.body.password,
      phoneNo: req.body.phoneNo,
    };

    const customer = await Customer.create(newCustomer);
    return res.status(201).send(customer);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Update a customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Customer.findOneAndUpdate(
      { C_ID: id },
      req.body,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).send({ message: 'Customer updated successfully', data: result });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Delete a customer and all related records (cascading delete)
export const deleteCustomer = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Step 1: Find the customer to make sure they exist
    const customer = await Customer.findOne({ C_ID: id }).session(session);

    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Step 2: Delete all feedback records associated with this customer
    const deletedFeedback = await Feedback.deleteMany({ 
      customerId: id 
    }).session(session);
    
    // Step 3: Find and delete payment records related to this customer
    // This will depend on how payments are linked to customers in your system
    // If payments have a direct reference to the customer ID:
    // const deletedPayments = await Payment.deleteMany({ 
    //   customerId: id 
    // }).session(session);

    // Step 4: Delete any bookings or other related records
    // Implement based on your data models
    // const deletedBookings = await Booking.deleteMany({
    //   customerId: id
    // }).session(session);

    // Step 5: Finally delete the customer
    const result = await Customer.findOneAndDelete({ 
      C_ID: id 
    }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ 
      message: 'Customer and all related records deleted successfully',
      deletedRecords: {
        feedback: deletedFeedback.deletedCount,
        // Include counts for other deleted record types
        // payments: deletedPayments.deletedCount,
        // bookings: deletedBookings.deletedCount,
      }
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Login controller
export const loginCustomer = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).send({
        message: 'Username and password are required',
      });
    }

    // Find customer by username
    const customer = await Customer.findOne({ userName });

    if (!customer) {
      return res.status(401).send({ message: 'Invalid username or password' });
    }

    // Check password
    if (customer.password !== password) {
      return res.status(401).send({ message: 'Invalid username or password' });
    }

    // Generate simple token
    const token = Buffer.from(`${customer.userName}:${Date.now()}`).toString('base64');

    return res.status(200).json({
      message: 'Login successful',
      token,
      customer: {
        C_ID: customer.C_ID,
        name: customer.firstName + ' ' + customer.lastName,
        userName: customer.userName,
        phoneNo: customer.phoneNo,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// Generate a unique customer ID
export const generateCustomerId = async (req, res) => {
  try {
    // Find the customer with the highest ID
    const lastCustomer = await Customer.findOne().sort({ C_ID: -1 });
    
    let newId;
    if (lastCustomer) {
      // Extract the number part and increment it
      const lastIdNum = parseInt(lastCustomer.C_ID.replace('CUS', ''));
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
