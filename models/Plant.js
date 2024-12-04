import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true},
    water: { type: Number, required: true},
    waterinfo: { type: String, required: true},
    lightrequirements: { type: String, required: true},
    potting: { type: String, required: true},
    image: { type: String, default: ''},
});

const Plant = mongoose.model('Plant', plantSchema);

export default Plant;


//elke log (nieuwe model maken)heeft een User, een plant en een tijdstip/datum
// water/en dingen dat je moet kunnen berekenen int nummer/int maken