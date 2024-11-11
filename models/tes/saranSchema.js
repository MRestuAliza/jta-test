import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const SaranSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    webId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['new', 'work in progress', 'completed', 'cancelled'],
        default: 'new',
    },
    link: {
        type: String,
        required: true,
    },
    has_comments: {
        type: Boolean,
        default: false,
    },
    voteScore: {
        type: Number,
        default: 0,
    },
    votes: [{
        _id: false,
        userId: String,
        voteType: Number,
    }],
    created_by: {
        type: String,
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

export default mongoose.models.Saran || mongoose.model('Saran', SaranSchema);
