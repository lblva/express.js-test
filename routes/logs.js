import express from 'express';
import Log from '../models/Log.js';
import User from '../models/User.js';
import Plant from '../models/Plant.js';

const router = express.Router();

// GET: Retrieve all logs
router.get('/', async (req, res) => {
    try {
        const logs = await Log.find(); // Fetch all logs from the database
        res.status(200).json(logs); // Send the retrieved logs as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

// GET: Retrieve watering status for a user's plants
router.get('/user/:userId/to-water', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get the user's plants
        const user = await User.findById(userId).populate('plants');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare watering data for each plant
        const plantWaterData = await Promise.all(
            user.plants.map(async (plant) => {
                // Find the latest log for the plant
                const log = await Log.findOne({ user: userId, plant: plant._id })
                    .sort({ wateredAt: -1 });

                // Determine if the plant is still considered watered
                const isWatered = log && new Date() < new Date(log.wateredUntil);

                return {
                    plantId: plant._id,
                    plantName: plant.name,
                    image: plant.image,
                    isWatered, // Add watering status
                    nextWateringDate: log ? log.wateredUntil : null,
                };
            })
        );

        res.json(plantWaterData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST: Log watering for a plant
router.post('/', async (req, res) => {
    const { plantId, user, wateredAt = new Date() } = req.body;

    if (!plantId || !user) {
        return res.status(400).json({ error: 'Missing required fields: plantId or user' });
    }

    // Calculate `wateredUntil` (10 hours after `wateredAt`)
    const wateredDate = new Date(wateredAt);
    const wateredUntil = new Date(wateredDate.getTime() + 30 * 1000);

    const newLog = new Log({
        user,
        plant: plantId,
        wateredAt: wateredDate,
        wateredUntil, // Include the calculated field
    });

    try {
        const savedLog = await newLog.save(); // Save the log to the database
        res.status(201).json({ log: 'Log added successfully!', logData: savedLog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add log' });
    }
});

// PUT: Update an existing log by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedLogData = req.body;

    try {
        const updatedLog = await Log.findByIdAndUpdate(id, updatedLogData, { new: true });
        if (updatedLog) {
            res.status(200).json({ log: 'Log updated successfully!', logData: updatedLog });
        } else {
            res.status(404).json({ message: 'Log not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update log' });
    }
});

// DELETE: Remove a log by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedLog = await Log.findByIdAndDelete(id);
        if (deletedLog) {
            res.status(200).json({ message: 'Log deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Log not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

export default router;
