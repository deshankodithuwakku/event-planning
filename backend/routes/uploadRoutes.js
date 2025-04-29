import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const bankSlipsDir = path.join(uploadDir, 'bank-slips');

// Create directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}
if (!fs.existsSync(bankSlipsDir)) {
  fs.mkdirSync(bankSlipsDir, { recursive: true });
  console.log('Created bank-slips directory');
}

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, bankSlipsDir);
  },
  filename: function(req, file, cb) {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Route for uploading bank slips
router.post('/bank-slip', upload.single('bankSlip'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get server base URL (use env var or default to localhost)
    const serverBaseUrl = process.env.SERVER_BASE_URL || 'http://localhost:5555';
    
    // Create absolute URL for the uploaded file
    const relativePath = `/uploads/bank-slips/${req.file.filename}`;
    const absoluteUrl = `${serverBaseUrl}${relativePath}`;
    
    console.log('File uploaded successfully:', {
      fileName: req.file.filename,
      absoluteUrl: absoluteUrl
    });
    
    res.status(201).json({
      message: 'File uploaded successfully',
      fileUrl: absoluteUrl, // Return absolute URL
      relativePath: relativePath, // Also return relative path for flexibility
      fileName: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test route to verify upload service is working
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Upload service is operational',
    uploadDirectories: {
      main: uploadDir,
      bankSlips: bankSlipsDir,
      mainExists: fs.existsSync(uploadDir),
      bankSlipsExists: fs.existsSync(bankSlipsDir)
    }
  });
});

export default router;
