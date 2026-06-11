import mongoose from 'mongoose';

const aiChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const AIChat = mongoose.model('AIChat', aiChatSchema);
export default AIChat;
