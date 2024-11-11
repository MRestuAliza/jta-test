import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CommentSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    saran_id: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 500,
    },
    ref_comment_id: {
        type: String,
        default: null,
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
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
