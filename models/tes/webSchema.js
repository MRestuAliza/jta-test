import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const WebsiteSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    name: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    link_advice: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Universitas', 'Fakultas', 'Prodi'],
        required: true,
    },
    ref_id: {
        type: String,
        required: true,
    },
    ref_model: {
        type: String,
        enum: ['Universitas', 'Fakultas', 'Prodi'],
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Website || mongoose.model('Website', WebsiteSchema);
