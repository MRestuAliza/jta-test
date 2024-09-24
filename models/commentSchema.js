import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    saran_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Saran',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    author_profile_picture: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
