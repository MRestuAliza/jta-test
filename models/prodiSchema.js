import mongoose from 'mongoose';

const ProdiSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    fakultas_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fakultas',  // Mengacu pada skema Fakultas
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

export default mongoose.models.Prodi || mongoose.model('Prodi', ProdiSchema);
