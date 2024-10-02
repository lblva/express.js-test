import express from 'express';
import indexRoute from './routes/index.js';
import messagesRoute from './routes/messages.js';
import usersRoute from './routes/users.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const app = express();

app.use(express.json());


mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected toDatabase'));



app.use('/', indexRoute); // zo importeer ik de model files 
app.use('/messages', messagesRoute);
app.use('/users', usersRoute); 

const PORT = process.env.PORT || 8503;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




