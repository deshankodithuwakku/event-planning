import express from 'express';
import { User } from '../models/userModel.js';
import { generateToken } from '../utils/jwtUtils.js';
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  generateAdminId
} from '../controllers/userController.js';

const router = express.Router();

// DEPRECATED: Will be removed in future versions
// Consider using the unified /api/auth/login endpoint instead
router.post('/login', async (request, response) => {
  try {
    const { userName, password } = request.body;

    if (!userName || !password) {
      return response.status(400).send({
        message: 'Username and password are required',
      });
    }

    // Find admin by username
    const admin = await User.findOne({ 
      userName, 
      role: 'admin' 
    });

    if (!admin) {
      return response.status(401).send({ message: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await admin.matchPassword(password);
    
    if (!isPasswordValid) {
      return response.status(401).send({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = generateToken(admin);

    // Return admin data
    return response.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        A_ID: admin.userId, // Map to original field name for backward compatibility
        userName: admin.userName,
        phoneNo: admin.phoneNo,
      },
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Forward to user controller endpoints for backward compatibility
router.get('/generate-id', generateAdminId);
router.post('/', createAdmin);
router.get('/', getAllAdmins);
router.get('/:id', getAdminById);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

export default router;
