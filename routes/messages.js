import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

//GET Retrieve all messages
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find(); // Fetch all messages from the database
        res.status(200).json(messages); // Send the retrieved messages as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
});

//POST: Add a new message
router.post('/', async (req, res) => {
    const { text, sender } = req.body;

    // Create a new message instance
    const newMessage = new Message({
        text,
        sender: sender || 'Anonymous', // Default to 'Anonymous' if sender is not provided
    });

    try {
        const savedMessage = await newMessage.save(); // Save the message to the database
        res.status(201).json({ message: 'Message added successfully!', messageData: savedMessage });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add message' });
    }
});



// PUT: Update an existing message by ID (66f3ddb09524ebed4d774bad)
router.put('/:id', async (req, res) => {
    const updatedMessageData = req.body; // Get the updated data from the request body
    const { id } = req.params;
    try {
        const updatedMessage = await Message.findByIdAndUpdate(id, updatedMessageData, { new: true });
        if (updatedMessage) {
            res.status(200).json({ message: 'Message updated successfully!', messageData: updatedMessage });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update message' });
    }
});


// DELETE: Remove a message by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMessage = await Message.findByIdAndDelete(id); // Find and delete the message by ID
        if (deletedMessage) {
            res.status(200).json({ message: 'Message deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

export default router;