import express from 'express';
import { Admin } from '../models/adminModel.js';

const router = express.Router();

// Route for admin login
router.post('/login', async (request, response) => {
  try {
    const { userName, password } = request.body;

    if (!userName || !password) {
      return response.status(400).send({
        message: 'Username and password are required',
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ userName });

    if (!admin) {
      return response.status(401).send({ message: 'Invalid username or password' });
    }

    // Check password (in a real app, you'd use bcrypt to compare hashed passwords)
    if (admin.password !== password) {
      return response.status(401).send({ message: 'Invalid username or password' });
    }

    // Generate simple token (in a real app, you'd use JWT)
    const token = Buffer.from(`${admin.userName}:${Date.now()}`).toString('base64');

    return response.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        A_ID: admin.A_ID,
        userName: admin.userName,
        phoneNo: admin.phoneNo,
      },
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for generating a unique admin ID
router.get('/generate-id', async (request, response) => {
  try {
    // Find the admin with the highest ID
    const lastAdmin = await Admin.findOne().sort({ A_ID: -1 });
    
    let newId;
    if (lastAdmin) {
      // Extract the number part and increment it
      const lastIdNum = parseInt(lastAdmin.A_ID.replace('AD', ''));
      newId = `AD${(lastIdNum + 1).toString().padStart(2, '0')}`;
    } else {
      // If no admins exist, start with AD01
      newId = 'AD01';
    }
    
    return response.status(200).json({ id: newId });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for creating a new admin
router.post('/', async (request, response) => {
  try {
    if (
      !request.body.A_ID ||
      !request.body.firstName ||
      !request.body.lastName ||
      !request.body.userName ||
      !request.body.password ||
      !request.body.phoneNo
    ) {
      return response.status(400).send({
        message: 'All fields are required: A_ID, firstName, lastName, userName, password, phoneNo',
      });
    }

    const newAdmin = {
      A_ID: request.body.A_ID,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      userName: request.body.userName,
      password: request.body.password,
      phoneNo: request.body.phoneNo,
    };

    const admin = await Admin.create(newAdmin);

    return response.status(201).send(admin);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get all admins
router.get('/', async (request, response) => {
  try {
    const admins = await Admin.find({});

    return response.status(200).json({
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get one admin by ID
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const admin = await Admin.findOne({ A_ID: id });

    if (!admin) {
      return response.status(404).json({ message: 'Admin not found' });
    }

    return response.status(200).json(admin);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to update an admin
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

    const result = await Admin.findOneAndUpdate(
      { A_ID: id },
      request.body,
      { new: true }
    );

    if (!result) {
      return response.status(404).json({ message: 'Admin not found' });
    }

    return response.status(200).send({ message: 'Admin updated successfully', data: result });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to delete an admin
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Admin.findOneAndDelete({ A_ID: id });

    if (!result) {
      return response.status(404).json({ message: 'Admin not found' });
    }

    return response.status(200).send({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
