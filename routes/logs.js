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
                    .sort({ wateredAt: -1 }); // Sort by date, descending

                const lastWatered = log ? log.wateredAt : null;
                const wateringFrequency = plant.water * 24 * 60 * 60 * 1000; // Water frequency in ms
                const nextWateringDate = lastWatered
                    ? new Date(new Date(lastWatered).getTime() + wateringFrequency)
                    : null;

                const remainingTime = nextWateringDate
                    ? Math.max(0, nextWateringDate.getTime() - Date.now())
                    : null;

                return {
                    plantId: plant._id,
                    plantName: plant.name,
                    image: plant.image,
                    nextWateringDate,
                    remainingTime, // Time remaining before the next watering in ms
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

    // Check if all required data is provided
    if (days === undefined || plantId === undefined || user === undefined) {
        return res.status(400).json({ error: 'Missing required fields: days, plantId, or user' });
    }
    

    // Calculate the correct watering date based on 'days' (days ago)
    const wateringDate = new Date();
    wateringDate.setDate(wateringDate.getDate() - days); // Subtract the specified number of days from the current date

    // Create a new log instance
    const newLog = new Log({
        user: user,        // User ID
        plant: plantId,    // Plant ID
        wateredAt: wateringDate, // Set the date as 'days ago'
    });

    try {
        const savedLog = await newLog.save(); // Save the log to the database
        res.status(201).json({ log: 'Log added successfully!', logData: savedLog });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to add log' });
    }
});

// POST: Log watering for a plant
router.post('/', async (req, res) => {
    const { days, plantId, user, wateredAt } = req.body;

    // Check if all required data is provided
    if (days === undefined || plantId === undefined || user === undefined || wateredAt === undefined) {
        return res.status(400).json({ error: 'Missing required fields: days, plantId, user, or wateredAt' });
    }

    // Parse wateredAt to a Date object
    const wateredDate = new Date(wateredAt);

    // Create a new log instance
    const newLog = new Log({
        user: user,          // User ID
        plant: plantId,      // Plant ID
        wateredAt: wateredDate, // Watered timestamp from client
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