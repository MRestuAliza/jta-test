import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const GroupSaranSchema = new mongoose.Schema({
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
        enum: ['Universitas', 'Fakultas', 'Prodi'],
        required: true,
    },
    website_id: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        unique: true,
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



export default mongoose.models.GroupSaran || mongoose.model('GroupSaran', GroupSaranSchema);