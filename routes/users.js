import express from 'express';
import User from '../models/User.js';
import Plant from '../models/Plant.js';

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

  router.get('/users/:userId/plants', async (req, res) => {
    const { userId } = req.params; // Fetch plants for a specific user
    try {
      const plants = await PlantModel.find({ userId });
      res.json(plants);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch plants' });
    }
  });
  
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id).populate('plants');
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
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

// POST: Add a plant to a user's collection
router.post('/:id/plants', async (req, res) => {
  const { id } = req.params;  // User ID from the URL
  const { plantId } = req.body;  // Plant ID from the request body

  console.log("User ID:", id);
  console.log("Plant ID:", plantId);

  try {
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const plant = await Plant.findById(plantId);
    if (!plant) {
      console.log('Plant not found');
      return res.status(404).json({ error: 'Plant not found' });
    }

    user.plants.push(plantId);
    await user.save();

    console.log('Plant added to user collection');
    res.status(200).json({ message: 'Plant added to your collection!', userData: user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to add the plant to user collection' });
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

router.delete('/users/:userId/plants', async (req, res) => {
  const { userId } = req.params;
  const { plantIds } = req.body;

  // Proceed with deleting plants from the database
  try {
    // Example of deleting plants
    const user = await User.findById(userId);  // Assuming you're using MongoDB
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.plants = user.plants.filter(plantId => !plantIds.includes(plantId));
    await user.save();

    return res.status(200).json({ message: 'Plants deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete plants', error });
  }
});


export default router;