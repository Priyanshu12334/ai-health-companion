import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, enum: ['Happy', 'Neutral', 'Sad', 'Stressed', 'Tired'], required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const MoodLog = mongoose.model('MoodLog', moodLogSchema);
export default MoodLog;
