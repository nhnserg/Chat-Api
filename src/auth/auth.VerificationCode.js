// import mongoose from 'mongoose';

// const verificationCodeSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   code: { type: String, required: true },
//   expiresAt: { type: Date, required: true },
// });

// export default mongoose.model('VerificationCode', verificationCodeSchema);

import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

export default mongoose.model('authVerificationCode', verificationSchema);
