import express from 'express';
import Log from '../models/Log.js';

const router = express.Router();

//GET Retrieve all logs
router.get('/', async (req, res) => {
    try {
        const logs = await Log.find(); // Fetch all logs from the database
        res.status(200).json(logs); // Send the retrieved logs as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

router.post('/', async (req, res) => {
    const { days, plantId, user } = req.body;
  
    // Check if all required data is provided
    if (!days || !plantId || !user) {
      return res.status(400).json({ error: 'Missing required fields: days, plantId, or user' });
    }
  
    // Create a new log instance
    const newLog = new Log({
      user: user,        // User ID
      plant: plantId,    // Plant ID
      wateredAt: new Date(), // You might want to set the date manually if needed
    });
  
    try {
      const savedLog = await newLog.save(); // Save the log to the database
      res.status(201).json({ log: 'Log added successfully!', logData: savedLog });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to add log' });
    }
  });



// PUT: Update an existing log by ID (66f3ddb09524ebed4d774bad)
router.put('/:id', async (req, res) => {
    const updatedLogData = req.body; // Get the updated data from the request body
    const { id } = req.params;
    try {
        const updatedLog = await Log.findByIdAndUpdate(id, updatedLogData, { new: true });
        if (updatedLog) {
            res.status(200).json({ log: 'Log updated successfully!', logData: updatedLog });
        } else {
            res.status(404).json({ log: 'Log not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update log' });
    }
});


// DELETE: Remove a log by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedLog = await Log.findByIdAndDelete(id); // Find and delete the log by ID
        if (deletedLog) {
            res.status(200).json({ log: 'Log deleted successfully!' });
        } else {
            res.status(404).json({ log: 'Log not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

export default router;