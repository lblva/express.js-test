import express from 'express';
import Plant from '../models/Plant.js';

const router = express();

//GET Retrieve all plants
router.get('/', async (req, res) => {
    try {
        const plants = await Plant.find(); // Fetch all users from the database
        res.status(200).json(plants); // Send the retrieved users as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve plants' });
    }
});

//POST: Add a new plant
router.post('/', async (req, res) => {

    // Create a new plant
    const newPlant = new Plant(req.body);

    try {
        const savedPlant = await newPlant.save(); // Save the plant to the database
        res.status(201).json({ user: 'Plant added successfully!', PlantData: savedPlant });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to add plant' });
    }
});

export default router;


//nog een post maken, om de date via insomnia in te vullen