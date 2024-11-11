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
  profilePicture: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
