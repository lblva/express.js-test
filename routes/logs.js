import express from 'express';
import Log from '../models/Log.js';
import User from '../models/User.js';
import Plant from '../models/Plant.js';

const router = express.Router();

// GET: Retrieve all logs
router.get('/', async (req, res) => {
    try {
        const logs = await Log.find();
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

// GET: Retrieve and calculate when plants need watering
router.get('/user/:userId/to-water', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('plants');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const plantWaterData = await Promise.all(
            user.plants.map(async (plant) => {
                const log = await Log.findOne({ user: userId, plant: plant._id })
                    .sort({ wateredAt: -1 });

                if (!log) {
                    return {
                        plantId: plant._id,
                        plantName: plant.name,
                        nextWateringDate: null,
                        isWatered: false,
                    };
                }

                const wateredAt = new Date(log.wateredAt);
                const wateringFrequency = plant.water * 24 * 60 * 60 * 1000; // in milliseconds
                const nextWateringDate = new Date(wateredAt.getTime() + wateringFrequency);
                const validUntil = log.validUntil ? new Date(log.validUntil) : null;
                const isWatered = validUntil && validUntil > new Date();

                // Logging for debugging purposes
                console.log(`Plant: ${plant.name}, WateredAt: ${wateredAt}, NextWateringDate: ${nextWateringDate}, ValidUntil: ${validUntil}`);


                return {
                    plantId: plant._id,
                    plantName: plant.name,
                    nextWateringDate: nextWateringDate.toISOString(),
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



// POST: Add a new watering log and include nextWateringDate in the response
router.post('/', async (req, res) => {
    const { days, plantId, user } = req.body;

    try {
        const wateredAt = new Date();
        wateredAt.setDate(wateredAt.getDate() - days); // Adjust the watered date based on 'days' provided

        const validUntil = new Date(wateredAt);
        validUntil.setSeconds(validUntil.getSeconds() + 30); // Adding 30 seconds for the "valid until" time

        const plant = await Plant.findById(plantId);
        if (!plant) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        const wateringFrequency = plant.water || 7; // Default to 7 days if not defined
        const nextWateringDate = new Date(wateredAt);
        nextWateringDate.setDate(wateredAt.getDate() + wateringFrequency); // Calculate the next watering date

        const newLog = new Log({
            user,
            plant: plantId,
            wateredAt,
            validUntil,
        });

        const savedLog = await newLog.save();

        res.status(201).json({
            message: 'Log added successfully!',
            logData: savedLog,
            nextWateringDate: nextWateringDate.toISOString(), // Return the calculated next watering date
        });
    } catch (error) {
        console.log(error);
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
        const deletedLog = await Log.findByIdAndDelete(id);
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
