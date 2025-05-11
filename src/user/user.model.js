import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    providers: {
      type: [String],
      enum: ['local', 'google'],
      default: ['local'],
    },
    avatar_url: { type: String, default: 'default' },
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export const User = model('User', userSchema);
