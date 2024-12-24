import express from 'express';
import User from '../models/User.js';

const router = express.Router();

//GET Retrieve all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.status(200).json(users); // Send the retrieved users as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

// GET: Retreive one user by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params; // == req.params.id;
    const user = await User.findById(id);
    res.json(user);
  }); 
  

//POST: Add a new user
router.post('/', async (req, res) => {

    // Create a new user instance
    const newUser = new User(req.body);

    try {
        const savedUser = await newUser.save(); // Save the user to the database
        res.status(201).json({ user: 'User added successfully!', userData: savedUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add user' });
    }
});



// PUT: Update or add a plant to the user's collection
router.put('/:userId/plants', async (req, res) => {
    const { userId } = req.params; // Get the user ID from params
    const { plantId } = req.body; // Get the plant ID from request body
    const { plantName, plantImage } = req.body; // Get plant details from request body
  
    try {
      // Find the user by userId
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if plant already exists in the user's plants array
      const plantIndex = user.plants.findIndex((plant) => plant._id.toString() === plantId);
  
      if (plantIndex !== -1) {
        // If plant exists, update the plant
        user.plants[plantIndex] = {
          ...user.plants[plantIndex],
          name: plantName,
          image: plantImage,
        };
        console.log('Plant updated');
      } else {
        // If plant does not exist, add it to the plants array
        user.plants.push({
          _id: plantId,
          name: plantName,
          image: plantImage,
        });
        console.log('Plant added');
      }
  
      // Save the user with updated plant collection
      await user.save();
  
      res.json({ message: 'Plant updated or added successfully!', userData: user });
    } catch (error) {
      console.error('Error updating or adding plant:', error);
      res.status(500).json({ message: 'Error updating or adding plant', error: error.message });
    }
  });
  




// DELETE: Remove a user by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id); // Find and delete the user by ID
        if (deletedUser) {
            res.status(200).json({ user: 'User deleted successfully!' });
        } else {
            res.status(404).json({ user: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;