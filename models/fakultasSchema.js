import mongoose from 'mongoose';

const FakultasSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    university_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Universitas',
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

export default mongoose.models.Fakultas || mongoose.model('Fakultas', FakultasSchema);
