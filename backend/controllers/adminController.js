import { Admin } from '../models/adminModel.js';

// Create admin controller
export const createAdmin = async (req, res) => {
  try {
    const { A_ID, userName, password, phoneNo } = req.body;
    
    // Create new admin (no firstName, lastName)
    const admin = new Admin({
      A_ID,
      userName,
      password, // Note: In a real app, this should be hashed
      phoneNo,
    });
    
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create admin', error });
  }
};

// Update admin controller
export const updateAdmin = async (req, res) => {
  try {
    const { userName, password, phoneNo } = req.body;
    
    // Update admin (no firstName, lastName)
    const updatedAdmin = {
      userName,
      password, // Note: In a real app, this should be hashed if changed
      phoneNo,
    };
    
    const admin = await Admin.findByIdAndUpdate(req.params.id, updatedAdmin, { new: true });
    res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update admin', error });
  }
};