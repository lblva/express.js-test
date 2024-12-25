import express from 'express';
import Plant from '../models/Plant.js';

const router = express();

//GET Retrieve all plants
// In your plants.js route file:
router.get('/', async (req, res) => {
    try {
      // Assuming you have the userId from the session or token
      const userId = req.user.id; // or you can get it from the request body/query if necessary
  
      const plants = await Plant.find({ userId: userId }).populate('userId');
      res.status(200).json(plants); // Send back only the plants for the current user
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
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