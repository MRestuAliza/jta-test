import mongoose from 'mongoose';

const SaranSchema = new mongoose.Schema({
    groupSaranId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupSaran',
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
        enum: ['new', 'in_progress', 'completed', 'cancelled'],
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
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Referensi ke skema User
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
