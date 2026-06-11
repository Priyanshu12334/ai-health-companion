import mongoose from 'mongoose';

const sleepLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bedtime: { type: Date, required: true },
  wakeupTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in hours
  quality: { type: String, enum: ['Poor', 'Fair', 'Good', 'Excellent'] }, // Optional calculated quality
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const SleepLog = mongoose.model('SleepLog', sleepLogSchema);
export default SleepLog;
