import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    nim: { type: String, default: '' },
    password: {
        type: String,
        required: function () {
            return this.loginProvider === 'credentials';
        },
    },
    loginProvider: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'Mahasiswa',
    },
    departementId: {
        type: String,
        ref: 'Department',
        default: '',
        required: function () {
            return this.role.startsWith('Admin');
        }
    },
    departmentType: {
        type: String,
        enum: ['Fakultas', 'Prodi', null],
        default: null,
        required: function () {
            return this.role.startsWith('Admin');
        }
    },
    profilePicture: {
        type: String,
        default: '',
    },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
}, {
    timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;