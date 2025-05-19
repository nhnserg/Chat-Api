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
    isVerified: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: false }
);

userSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    delete ret.providers;
    return ret;
  },
});

export const User = model('User', userSchema);
