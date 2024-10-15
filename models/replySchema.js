
import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true,
    },
    content: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 500,
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

export default mongoose.models.Reply || mongoose.model('Reply', ReplySchema);
