import { User } from '../models/userModel.js';
import { generateToken } from '../utils/jwtUtils.js';

/**
 * Unified login handler for both customers and admins
 */
export const unifiedLogin = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).send({
        message: 'Username and password are required',
      });
    }

    // Find user by username
    const user = await User.findOne({ userName });
    
    if (!user) {
      return res.status(401).send({ message: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = generateToken(user);
    
    // Prepare response based on user role
    if (user.role === 'customer') {
      return res.status(200).json({
        message: 'Login successful',
        token,
        userType: 'customer',
        user: {
          userId: user.userId,
          name: `${user.firstName} ${user.lastName}`,
          userName: user.userName,
          phoneNo: user.phoneNo,
          role: user.role
        },
      });
    } else if (user.role === 'admin') {
      return res.status(200).json({
        message: 'Login successful',
        token,
        userType: 'admin',
        user: {
          userId: user.userId,
          userName: user.userName,
          phoneNo: user.phoneNo,
          role: user.role
        },
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

/**
 * Get current user profile based on JWT token
 */
export const getCurrentUser = async (req, res) => {
  try {
    const { id } = req.user;
    
    const user = await User.findOne({ userId: id }).select('-password');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return appropriate data based on role
    if (user.role === 'customer') {
      return res.status(200).json({
        userId: user.userId,
        C_ID: user.userId, // Include C_ID for backward compatibility
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        userName: user.userName,
        phoneNo: user.phoneNo,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } else {
      return res.status(200).json({
        userId: user.userId,
        A_ID: user.userId, // Include A_ID for backward compatibility
        userName: user.userName,
        phoneNo: user.phoneNo,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};
