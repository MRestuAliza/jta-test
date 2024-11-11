import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const VoteSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    userId: {
        type: String,
        required: true,
    },
    saranId: {
        type: String,
        required: true,
    },
    voteType: {
        type: String,
        enum: ['upvote', 'downvote'],
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
