import express from 'express';
import { Customer } from '../models/customerModel.js';

const router = express.Router();

// Route for generating a unique customer ID
router.get('/generate-id', async (request, response) => {
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
    
    return response.status(200).json({ id: newId });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for creating a new customer
router.post('/', async (request, response) => {
  try {
    if (
      !request.body.C_ID ||
      !request.body.firstName ||
      !request.body.lastName ||
      !request.body.userName ||
      !request.body.password ||
      !request.body.phoneNo
    ) {
      return response.status(400).send({
        message: 'All fields are required: C_ID, firstName, lastName, userName, password, phoneNo',
      });
    }

    const newCustomer = {
      C_ID: request.body.C_ID,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      userName: request.body.userName,
      password: request.body.password,
      phoneNo: request.body.phoneNo,
    };

    const customer = await Customer.create(newCustomer);

    return response.status(201).send(customer);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get all customers
router.get('/', async (request, response) => {
  try {
    const customers = await Customer.find({});

    return response.status(200).json({
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get one customer by ID
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const customer = await Customer.findOne({ C_ID: id });

    if (!customer) {
      return response.status(404).json({ message: 'Customer not found' });
    }

    return response.status(200).json(customer);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to update a customer
router.put('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    if (
      !request.body.firstName &&
      !request.body.lastName &&
      !request.body.userName &&
      !request.body.password &&
      !request.body.phoneNo
    ) {
      return response.status(400).send({
        message: 'At least one field is required to update',
      });
    }

    const result = await Customer.findOneAndUpdate(
      { C_ID: id },
      request.body,
      { new: true }
    );

    if (!result) {
      return response.status(404).json({ message: 'Customer not found' });
    }

    return response.status(200).send({ message: 'Customer updated successfully', data: result });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to delete a customer
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Customer.findOneAndDelete({ C_ID: id });

    if (!result) {
      return response.status(404).json({ message: 'Customer not found' });
    }

    return response.status(200).send({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for customer login
router.post('/login', async (request, response) => {
  try {
    const { userName, password } = request.body;

    if (!userName || !password) {
      return response.status(400).send({
        message: 'Username and password are required',
      });
    }

    // Find customer by username
    const customer = await Customer.findOne({ userName });

    if (!customer) {
      return response.status(401).send({ message: 'Invalid username or password' });
    }

    // Check password (in a real app, you'd use bcrypt to compare hashed passwords)
    if (customer.password !== password) {
      return response.status(401).send({ message: 'Invalid username or password' });
    }

    // Generate simple token (in a real app, you'd use JWT)
    const token = Buffer.from(`${customer.userName}:${Date.now()}`).toString('base64');

    return response.status(200).json({
      message: 'Login successful',
      token,
      customer: {
        C_ID: customer.C_ID,
        name: customer.name,
        userName: customer.userName,
        phoneNo: customer.phoneNo,
      },
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
