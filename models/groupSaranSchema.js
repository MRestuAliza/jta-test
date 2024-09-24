import mongoose from 'mongoose';

const GroupSaranSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Nama dari grup saran
    },
    website_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
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
