import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDirectories = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const bankSlipsDir = path.join(uploadsDir, 'bank-slips');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create bank-slips directory if it doesn't exist
  if (!fs.existsSync(bankSlipsDir)) {
    console.log('Creating bank-slips directory...');
    fs.mkdirSync(bankSlipsDir, { recursive: true });
  }
  
  console.log('Directory setup complete.');
};

export default setupDirectories;
