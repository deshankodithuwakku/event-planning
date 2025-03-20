import express from 'express';
import { Package } from '../models/packageModel.js';

const router = express.Router();

// Route for generating a unique package ID
router.get('/generate-id', async (request, response) => {
  try {
    // Find the package with the highest ID
    const lastPackage = await Package.findOne().sort({ Pg_ID: -1 });
    
    let newId;
    if (lastPackage) {
      // Extract the number part and increment it
      const lastIdNum = parseInt(lastPackage.Pg_ID.replace('PG', ''));
      newId = `PG${(lastIdNum + 1).toString().padStart(3, '0')}`;
    } else {
      // If no packages exist, start with PG001
      newId = 'PG001';
    }
    
    return response.status(200).json({ id: newId });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for creating a new package
router.post('/', async (request, response) => {
  try {
    if (
      !request.body.Pg_ID ||
      !request.body.Pg_price ||
      !request.body.event
    ) {
      return response.status(400).send({
        message: 'Required fields missing: Pg_ID, Pg_price, event',
      });
    }

    const newPackage = {
      Pg_ID: request.body.Pg_ID,
      Pg_price: request.body.Pg_price,
      event: request.body.event
    };

    const package_ = await Package.create(newPackage);
    return response.status(201).send(package_);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get all packages
router.get('/', async (request, response) => {
  try {
    const packages = await Package.find({});
    return response.status(200).json({
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get packages for a specific event
router.get('/event/:eventId', async (request, response) => {
  try {
    const { eventId } = request.params;
    const packages = await Package.find({ event: eventId });
    
    return response.status(200).json({
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get one package by ID
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const package_ = await Package.findOne({ Pg_ID: id });

    if (!package_) {
      return response.status(404).json({ message: 'Package not found' });
    }

    return response.status(200).json(package_);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to update a package
router.put('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    
    // Only allow updating Pg_price field
    const updateData = {};
    if (request.body.Pg_price !== undefined) {
      updateData.Pg_price = request.body.Pg_price;
    }
    
    if (Object.keys(updateData).length === 0) {
      return response.status(400).send({
        message: 'No valid fields to update',
      });
    }
    
    const result = await Package.findOneAndUpdate(
      { Pg_ID: id },
      updateData,
      { new: true }
    );

    if (!result) {
      return response.status(404).json({ message: 'Package not found' });
    }

    return response.status(200).send({ message: 'Package updated successfully', data: result });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to delete a package
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Package.findOneAndDelete({ Pg_ID: id });

    if (!result) {
      return response.status(404).json({ message: 'Package not found' });
    }

    return response.status(200).send({ message: 'Package deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
