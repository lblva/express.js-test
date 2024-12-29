import express from 'express';
import Log from '../models/Log.js';
import User from '../models/User.js';
import Plant from '../models/Plant.js';

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

// GET: Retrieve and calculate when plants need watering
router.get('/user/:userId/to-water', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get the user's plants
        const user = await User.findById(userId).populate('plants');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare plant watering data
        const plantWaterData = await Promise.all(
            user.plants.map(async (plant) => {
                // Find the latest log for the plant
                const log = await Log.findOne({ user: userId, plant: plant._id })
                    .sort({ wateredAt: -1 });

                const lastWatered = log ? log.wateredAt : null;
                const validUntil = log ? log.validUntil : null;

                const isWatered = validUntil && new Date(validUntil) > new Date();

                // Calculate the next watering date based on the last watered date and watering frequency
                const wateringFrequency = plant.water * 24 * 60 * 60 * 1000; // Water frequency in ms
                const nextWateringDate = lastWatered
                    ? new Date(new Date(lastWatered).getTime() + wateringFrequency)
                    : null;

                return {
                    plantId: plant._id,
                    plantName: plant.name,
                    nextWateringDate,
                    isWatered,
                };
            })
        );

        res.json(plantWaterData);
    } catch (error) {
        console.error('Error in /user/:userId/to-water:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST: Log watering for a plant
router.post('/', async (req, res) => {
    const { days, plantId, user } = req.body;

    // Calculate the watering date and validUntil timestamp
    const wateredAt = new Date();
    wateredAt.setDate(wateredAt.getDate() - days); // Subtract days to get the watering date

    const validUntil = new Date(wateredAt);
    validUntil.setSeconds(validUntil.getSeconds() + 30); // Keep the 30-second watering status

    // Create a new log instance
    const newLog = new Log({
        user: user,
        plant: plantId,
        wateredAt,
        validUntil, // This will show the plant as watered for 30 seconds
    });

    try {
        const savedLog = await newLog.save();
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