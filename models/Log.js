import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plant: {type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    wateredAt: {type: Date, default: Date.now},
});

const Log = mongoose.model('Log', logSchema);

export default Log;


//elke log (nieuwe model maken)heeft een User, een plant en een tijdstip/datum