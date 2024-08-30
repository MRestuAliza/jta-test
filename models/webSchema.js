import mongoose from 'mongoose';

const WebsiteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Universitas', 'Fakultas', 'Prodi'],
        required: true,
    },
    university_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Universitas',
        required: true,
    },
    fakultas_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fakultas',
        default: null,
    },
    prodi_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prodi',
        default: null,
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

export default mongoose.models.Website || mongoose.model('Website', WebsiteSchema);
