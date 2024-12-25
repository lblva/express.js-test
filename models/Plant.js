import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    water: { type: Number, required: true },
    waterinfo: { type: String, required: true },
    lightrequirements: { type: String, required: true },
    potting: { type: String, required: true },
    image: { type: String, default: '' },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of users who own the plant
});

const Plant = mongoose.model('Plant', plantSchema);

export default Plant;
