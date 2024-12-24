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



// PUT: Update an existing user by ID (66f3ddb09524ebed4d774bad)
router.put('/:id', async (req, res) => {
    const updatedUserData = req.body; // Get the updated data from the request body
    const { id } = req.params;
    try {
        const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
        if (updatedUser) {
            res.status(200).json({ user: 'User updated successfully!', userData: updatedUser });
        } else {
            res.status(404).json({ user: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Add a plant to the user's list
app.put('/users/:userId/plants', async (req, res) => {
    const { userId } = req.params;
    const { plantId } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (!user.plants.includes(plantId)) {
        user.plants.push(plantId);
        await user.save();
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
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