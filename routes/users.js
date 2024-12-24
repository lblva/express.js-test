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



// PUT: Update an existing user
router.put('/:id', async (req, res) => {
    const { id } = req.params; // Get the user ID from params
    const updatedUser = req.body; // Get the new user data from request body
    
    try {
      const user = await User.findByIdAndUpdate(id, updatedUser, { new: true });
      if (user) {
        res.json({ user: 'User updated successfully!', userData: user });
      } else {
        res.status(404).json({ user: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ user: 'Error updating user', error: error.user });
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