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

router.get('/plants', async (req, res) => {
    const userId = req.user.id; // Assuming you have the user ID in the request after verifying the token
    
    try {
      // Query plants that the user owns (filter by userId)
      const plants = await Plant.find({ 'users._id': userId });
  
      res.json(plants);  // Send the filtered plants
    } catch (error) {
      console.error('Error fetching plants:', error);
      res.status(500).json({ message: 'Error fetching plants' });
    }
  });
  
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Fetching plant with ID:', id);
    try {
      const plant = await Plant.findById(id);
      res.json(plant);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch plant' });
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

router.post('/plants/:plantId/users', async (req, res) => {
    const { userId } = req.body; // User ID to associate with the plant
    const { plantId } = req.params;
  
    try {
      const plant = await Plant.findById(plantId);
  
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }
  
      // Add the user to the plant's users array
      if (!plant.users.includes(userId)) {
        plant.users.push(userId);
        await plant.save();
      }
  
      res.status(200).json(plant);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  


router.patch('/:id', async (req, res) => {
    const updatedPlantData = req.body; // Get the updated data from the request body
    const { id } = req.params;
    try {
        const updatedPlant = await Plant.findByIdAndUpdate(id, updatedPlantData, { new: true });
        if (updatedPlant) {
            res.status(200).json({ plant: 'Plant updated successfully!', plantData: updatedPlant });
        } else {
            res.status(404).json({ plant: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update plant' });
    }
});

router.delete('/plants/:plantId/users/:userId', async (req, res) => {
    const { plantId, userId } = req.params;
  
    try {
      const plant = await Plant.findById(plantId);
  
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }
  
      // Remove the user from the plant's users array
      plant.users = plant.users.filter(user => user.toString() !== userId);
      await plant.save();
  
      res.status(200).json(plant);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

export default router;


//nog een post maken, om de date via insomnia in te vullen