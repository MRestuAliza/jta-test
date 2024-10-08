import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
    saranId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Saran',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
