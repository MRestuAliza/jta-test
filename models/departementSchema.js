import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const DepartementSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Fakultas', 'Prodi'],
        required: true,
        default: null,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    ref_ids: {
        type: Array,
        default: null,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Departement || mongoose.model('Departement', DepartementSchema);
