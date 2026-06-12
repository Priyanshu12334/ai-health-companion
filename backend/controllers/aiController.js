import OpenAI from 'openai';
import AIChat from '../models/AIChat.js';
import User from '../models/User.js';
import HydrationLog from '../models/HydrationLog.js';
import SleepLog from '../models/SleepLog.js';
import MoodLog from '../models/MoodLog.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    // Fetch user context
    const user = await User.findById(req.user._id);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hydrationLogs = await HydrationLog.find({ userId: req.user._id, date: { $gte: today } });
    const totalWater = hydrationLogs.reduce((acc, log) => acc + log.amount, 0);

    const sleepLog = await SleepLog.findOne({ userId: req.user._id }).sort({ date: -1 });
    const moodLog = await MoodLog.findOne({ userId: req.user._id }).sort({ date: -1 });

    const context = `
      User Goals:
      - Improve Hydration: ${user.goals?.improveHydration}
      - Better Sleep: ${user.goals?.betterSleep}
      - Build Healthy Habits: ${user.goals?.buildHealthyHabits}
      
      Current Health Context for today:
      - Water Intake: ${totalWater} ml (Goal: ${user.dailyWaterGoal} ml)
      - Sleep: ${sleepLog ? sleepLog.duration + ' hours' : 'No data yet'} (Goal: ${user.dailySleepGoal} hours)
      - Current Mood: ${moodLog ? moodLog.mood : 'No data yet'}
    `;

    const systemPrompt = `You are Aurora, a friendly AI health companion.

Rules:
- Use the user's hydration, sleep, and mood data.
- Keep responses extremely concise.
- Maximum 2 short sentences.
- Maximum 30 words.
- Give one practical suggestion only.
- Avoid long explanations.
- Avoid bullet points.
- Sound supportive and natural.

${context}`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 250
    });

    const aiResponse = completion.choices[0].message.content;

    // Store chat
    const chatLog = await AIChat.create({
      userId: req.user._id,
      message,
      response: aiResponse
    });

    res.json(chatLog);

  } catch (error) {
    console.error('Groq AI Error:', error);
    res.status(500).json({ message: 'Failed to communicate with AI', error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const chats = await AIChat.find({ userId: req.user._id }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await AIChat.findOneAndDelete({ _id: id, userId: req.user._id });
    res.json({ message: 'Chat message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await AIChat.deleteMany({ userId: req.user._id });
    res.json({ message: 'All chat history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
