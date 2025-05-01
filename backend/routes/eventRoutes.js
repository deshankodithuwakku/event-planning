import express from 'express';
import { Event } from '../models/eventModel.js';

const router = express.Router();

// Route for generating a unique event ID
router.get('/generate-id', async (request, response) => {
  try {
    // Find the event with the highest ID
    const lastEvent = await Event.findOne().sort({ E_ID: -1 });
    
    let newId;
    if (lastEvent) {
      // Extract the number part and increment it
      const lastIdNum = parseInt(lastEvent.E_ID.replace('EVT', ''));
      newId = `EVT${(lastIdNum + 1).toString().padStart(3, '0')}`;
    } else {
      // If no events exist, start with EVT001
      newId = 'EVT001';
    }
    
    return response.status(200).json({ id: newId });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for creating a new event
router.post('/', async (request, response) => {
  try {
    if (
      !request.body.E_ID ||
      !request.body.E_name ||
      !request.body.E_description
    ) {
      return response.status(400).send({
        message: 'Required fields missing',
      });
    }

    const newEvent = {
      E_ID: request.body.E_ID,
      E_name: request.body.E_name,
      E_description: request.body.E_description,
      status: request.body.status
    };

    const event = await Event.create(newEvent);
    return response.status(201).send(event);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get all events
router.get('/', async (request, response) => {
  try {
    const events = await Event.find({});
    return response.status(200).json({
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to get one event by ID
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const event = await Event.findOne({ E_ID: id });

    if (!event) {
      return response.status(404).json({ message: 'Event not found' });
    }

    return response.status(200).json(event);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to update an event
router.put('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Event.findOneAndUpdate(
      { E_ID: id },
      request.body,
      { new: true }
    );

    if (!result) {
      return response.status(404).json({ message: 'Event not found' });
    }

    return response.status(200).send({ message: 'Event updated successfully', data: result });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route to delete an event
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Event.findOneAndDelete({ E_ID: id });

    if (!result) {
      return response.status(404).json({ message: 'Event not found' });
    }

    return response.status(200).send({ message: 'Event deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
