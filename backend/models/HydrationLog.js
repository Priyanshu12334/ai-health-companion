import mongoose from 'mongoose';

const hydrationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // in ml
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const HydrationLog = mongoose.model('HydrationLog', hydrationLogSchema);
export default HydrationLog;
