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
        minlength: 1,
        maxlength: 500,
    },
    voteScore: {
        type: Number,
        default: 0,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
