import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true},
    password: { type: String, required: true},
    plants: [{type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }],
    profilePicture: { type: String, default: ''},
    createdAt: {type: Date, default: Date.now},
});

const User = mongoose.model('User', userSchema);

export default User;