import express from 'express';
import { Admin } from '../models/adminModel.js';

const router = express.Router();

// Manual validation middleware instead of express-validator
const validateAdmin = (req, res, next) => {
  const { A_ID, userName, password, phoneNo } = req.body;
  const errors = [];

  if (!A_ID) errors.push('Admin ID is required');
  if (!userName) errors.push('Username is required');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters long');
  if (!phoneNo) errors.push('Phone number is required');

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  next();
};

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
router.post('/', validateAdmin, async (req, res) => {
  try {
    const { A_ID, userName, password, phoneNo } = req.body;
    
    // Create new admin with the updated schema (no firstName, lastName)
    const admin = new Admin({
      A_ID,
      userName,
      password, // Note: In a real app, this should be hashed
      phoneNo,
    });
    
    const savedAdmin = await admin.save();

    return res.status(201).send(savedAdmin);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
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
router.put('/:id', validateAdmin, async (req, res) => {
  try {
    const { userName, password, phoneNo } = req.body;
    
    // Update admin with the updated schema (no firstName, lastName)
    const updatedAdmin = {
      userName,
      password, // Note: In a real app, this should be hashed if it's changed
      phoneNo,
    };
    
    const result = await Admin.findOneAndUpdate(
      { A_ID: req.params.id },
      updatedAdmin,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(200).send({ message: 'Admin updated successfully', data: result });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
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
