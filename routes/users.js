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