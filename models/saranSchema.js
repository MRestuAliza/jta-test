import mongoose from 'mongoose';

const SaranSchema = new mongoose.Schema({
    groupSaranId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupSaran', // Menghubungkan saran ke grup saran
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
        enum: ['new', 'in_progress', 'completed', 'cancelled'], // Enum untuk status yang diizinkan
        default: 'new', // Default status
    },
    has_comments: {
        type: Boolean,
        default: false,
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
