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



// PUT: Update user details or add a plant to the user's collection
router.put('/:userId', async (req, res) => {
    const { userId } = req.params; // Get the user ID from params
    const { name, plantId, plantName, plantImage } = req.body; // Get user name and plant details from request body
  
    try {
      // Find the user by userId
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // If the user provided a new name, update it
      if (name) {
        user.name = name;
        console.log('User name updated');
      }
  
      // If the request includes plant details (plantId, plantName, plantImage), add the plant to the collection
      if (plantId && plantName && plantImage) {
        // Add the plant to the user's plants array
        user.plants.push({
          _id: plantId,
          name: plantName,
          image: plantImage,
        });
        console.log('Plant added');
      }
  
      // Save the user with updated details (name and/or new plant)
      await user.save();
  
      res.json({ message: 'User updated and plant added successfully!', userData: user });
    } catch (error) {
      console.error('Error updating user or adding plant:', error);
      res.status(500).json({ message: 'Error updating user or adding plant', error: error.message });
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