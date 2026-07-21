import OpenAI from 'openai';
import AIChat from '../models/AIChat.js';
import User from '../models/User.js';
import HydrationLog from '../models/HydrationLog.js';
import SleepLog from '../models/SleepLog.js';
import MoodLog from '../models/MoodLog.js';
import { getStartOfToday } from '../utils/timezone.js';

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
    
    const startOfToday = getStartOfToday(req);

    const hydrationLogs = await HydrationLog.find({ userId: req.user._id, date: { $gte: startOfToday } });
    const totalWater = hydrationLogs.reduce((acc, log) => acc + log.amount, 0);

    const sleepLog = await SleepLog.findOne({ userId: req.user._id, date: { $gte: startOfToday } }).sort({ date: -1 });
    const moodLog = await MoodLog.findOne({ userId: req.user._id, date: { $gte: startOfToday } }).sort({ date: -1 });

    // Calculate Health Score dynamically matching frontend formulas
    let sleepScore = 25;
    if (sleepLog) {
      const sleepDuration = sleepLog.duration;
      if (sleepDuration >= 8) sleepScore = 40;
      else if (sleepDuration >= 7) sleepScore = 35;
      else if (sleepDuration >= 6) sleepScore = 25;
      else if (sleepDuration >= 5) sleepScore = 15;
      else sleepScore = 5;
    }

    let hydrationScore = 15;
    if (totalWater > 0) {
      if (totalWater >= 2500) hydrationScore = 30;
      else if (totalWater >= 2000) hydrationScore = 25;
      else if (totalWater >= 1500) hydrationScore = 15;
      else if (totalWater >= 1000) hydrationScore = 10;
      else hydrationScore = 5;
    }

    let moodScore = 20;
    if (moodLog) {
      const currentMood = moodLog.mood;
      if (currentMood === 'Happy') moodScore = 30;
      else if (currentMood === 'Calm') moodScore = 25;
      else if (currentMood === 'Neutral') moodScore = 20;
      else if (currentMood === 'Tired') moodScore = 15;
      else if (currentMood === 'Sad') moodScore = 10;
      else if (currentMood === 'Stressed') moodScore = 5;
    }

    const healthScore = sleepScore + hydrationScore + moodScore;

    const cleanMsg = message.toLowerCase();
    let intent = 'Other';

    if (cleanMsg.includes('sleep') || cleanMsg.includes('rest') || cleanMsg.includes('bed') || cleanMsg.includes('tired') || cleanMsg.includes('exhausted')) {
      intent = 'Sleep';
    } else if (cleanMsg.includes('water') || cleanMsg.includes('drink') || cleanMsg.includes('dehydrate') || cleanMsg.includes('hydrat')) {
      intent = 'Hydration';
    } else if (cleanMsg.includes('mood') || cleanMsg.includes('feel') || cleanMsg.includes('happy') || cleanMsg.includes('sad') || cleanMsg.includes('depress') || cleanMsg.includes('anxi') || cleanMsg.includes('stress')) {
      intent = 'Mood';
    } else if (cleanMsg.includes('breakfast') || cleanMsg.includes('morning meal')) {
      intent = 'Breakfast';
    } else if (cleanMsg.includes('lunch') || cleanMsg.includes('afternoon meal')) {
      intent = 'Lunch';
    } else if (cleanMsg.includes('dinner') || cleanMsg.includes('night meal')) {
      intent = 'Dinner';
    } else if (cleanMsg.includes('eat') || cleanMsg.includes('food') || cleanMsg.includes('nutrit') || cleanMsg.includes('diet') || cleanMsg.includes('meal')) {
      intent = 'Nutrition';
    } else if (cleanMsg.includes('health') || cleanMsg.includes('score') || cleanMsg.includes('overall')) {
      intent = 'General Health';
    } else if (cleanMsg.includes('report') || cleanMsg.includes('simplif') || cleanMsg.includes('doctor') || cleanMsg.includes('lab') || cleanMsg.includes('test')) {
      intent = 'Medical Report';
    }

    // Select relevant health data based on intent
    let filteredContext = {};
    if (intent === 'Sleep' || intent === 'Mood' || intent === 'General Health') {
      filteredContext = {
        healthScore: healthScore,
        sleepHours: sleepLog ? sleepLog.duration : 0,
        mood: moodLog ? moodLog.mood.toLowerCase() : "neutral"
      };
    } else if (intent === 'Hydration') {
      filteredContext = {
        hydration: totalWater,
        hydrationGoal: user.dailyWaterGoal || 2500
      };
    } else if (intent === 'Breakfast' || intent === 'Lunch' || intent === 'Dinner' || intent === 'Nutrition') {
      filteredContext = {};
      // DO NOT mention hydration unless hydration is critically low (< 1000ml)
      if (totalWater < 1000) {
        filteredContext.hydration = totalWater;
        filteredContext.hydrationGoal = user.dailyWaterGoal || 2500;
        filteredContext.hydrationStatus = "Critically Low";
      }
    } else {
      filteredContext = {
        healthScore: healthScore
      };
    }

    console.log('--- NUTRITION COACH PERSONALIZATION DEBUG ---');
    console.log('USER MESSAGE:', message);
    console.log('INTENT DETECTED:', intent);
    console.log('FILTERED CONTEXT:', JSON.stringify(filteredContext, null, 2));
    console.log('--- END DEBUG ---');

    const systemPrompt = `You are an AI Health Assistant.

Your job is to answer the user's question using ONLY the relevant health data.

Current User Health Data:
${JSON.stringify(filteredContext, null, 2)}

Rules:

1. First identify the user's intent.
Possible intents: Sleep, Hydration, Mood, Nutrition, Breakfast, Lunch, Dinner, General Health, Medical Report, Other.

2. Use ONLY relevant data for the answer. Do NOT mention unrelated metrics.
- If user asks about breakfast: Suggest options from [Poha, Upma, Sprouts, Oats, Eggs, Banana, Milk]. DO NOT mention hydration or water unless hydration is critically low (< 1000ml).
- If user asks about lunch: Suggest options from [Roti, Dal, Rice, Rajma, Paneer, Vegetables, Curd]. DO NOT mention water, sleep, or mood.
- If user asks about dinner: Suggest options from [Roti, Dal, Paneer, Khichdi, Vegetables, Soup]. DO NOT mention water, sleep, or mood.
- If user asks "I feel tired": Use ONLY sleep, mood, or health score to respond. Do not talk about hydration or water.
- If user asks "I feel dehydrated": Use ONLY hydration data to respond.
- If user asks "Why is my health score low?": Use health score breakdown to respond.

3. Never mention all health metrics in every answer.
4. Give direct answers first.
5. Maximum response length: 2-3 short sentences.
6. Return plain text only.
7. Avoid repetitive phrases like "Drink water first", "Stay hydrated", or "Drink more water", unless hydration-related questions are asked.
8. Keep answers practical and personalized.
`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 150
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
