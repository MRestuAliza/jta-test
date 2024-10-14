import mongoose from 'mongoose';

const GroupSaranSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Universitas', 'Fakultas', 'Prodi'],
        required: true,
    },
    website_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        required: true,
    },
    university_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Universitas', // Ref ke Universitas
        required: true,
    },
    fakultas_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fakultas', // Ref ke Fakultas
        required: false, // Tidak wajib jika hanya berdasarkan universitas
    },
    prodi_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prodi', // Ref ke Prodi
        required: false, // Tidak wajib jika hanya berdasarkan fakultas
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