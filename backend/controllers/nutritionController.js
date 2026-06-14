import OpenAI from 'openai';
import { nutritionDb } from '../utils/nutritionDb.js';
import HydrationLog from '../models/HydrationLog.js';
import SleepLog from '../models/SleepLog.js';
import MoodLog from '../models/MoodLog.js';
import { getStartOfToday } from '../utils/timezone.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const recommendationsPath = path.join(__dirname, '../utils/mealRecommendations.json');
const mealRecommendations = JSON.parse(fs.readFileSync(recommendationsPath, 'utf-8'));

// Search Food (Local first, AI fallback)
export const searchFood = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const cleanQuery = q.trim().toLowerCase();

    // 1. Try exact match in local database
    let food = nutritionDb.find(item => item.name.toLowerCase() === cleanQuery);

    // 2. Try partial match or natural questions (e.g. "Is Samosa Healthy?")
    if (!food) {
      const queryWords = cleanQuery.split(/[^a-z0-9]/).filter(Boolean);
      food = nutritionDb.find(item => {
        const nameLower = item.name.toLowerCase();
        const isPhraseInQuery = cleanQuery.includes(nameLower);
        
        // Prevent false positives on short words (e.g. "tea" in "teacher", "egg" in "veggie")
        if (isPhraseInQuery && nameLower.length <= 4) {
          return queryWords.includes(nameLower);
        }
        
        return isPhraseInQuery || nameLower.includes(cleanQuery);
      });
    }

    // 3. If found locally, return it immediately
    if (food) {
      let alternatives = [];
      if (food.healthRating < 7) {
        alternatives = nutritionDb
          .filter(item => item.category === food.category && item.healthRating >= 7 && item.id !== food.id)
          .slice(0, 3);
        if (alternatives.length === 0) {
          alternatives = nutritionDb
            .filter(item => item.category === "Healthy Snacks")
            .slice(0, 3);
        }
      }
      return res.json({
        source: 'local',
        data: food,
        alternatives
      });
    }

    // 4. Fallback to Groq AI if not found locally
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'AI configuration is missing and food not found locally.' });
    }

    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    const systemPrompt = `You are a nutrition assistant.
Analyze the food item requested by the user.
Provide the nutrition information in raw JSON format with the following keys:
{
  "name": "Food Name",
  "calories": number,
  "protein": "number + g",
  "carbs": "number + g",
  "fats": "number + g",
  "healthRating": number (1-10),
  "recommendation": "Simple, concise recommendation under 15 words"
}

Rules:
- Return ONLY the raw JSON object.
- Do NOT wrap it in markdown code blocks or write any introductions/explanations.
- Use realistic nutritional values if the food exists, or sensible estimates if it's a specific combination.
`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Provide nutrition info for: ${q}` }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    const aiResponse = completion.choices[0].message.content;

    // Parse the JSON response
    try {
      let cleanText = aiResponse.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
      }

      const parsedData = JSON.parse(cleanText);

      // Verify required fields exist
      if (
        parsedData.name &&
        parsedData.calories !== undefined &&
        parsedData.protein &&
        parsedData.carbs &&
        parsedData.fats &&
        parsedData.healthRating !== undefined
      ) {
        const rating = Number(parsedData.healthRating);
        let alternatives = [];
        if (rating < 7) {
          alternatives = nutritionDb
            .filter(item => item.category === "Healthy Snacks")
            .slice(0, 3);
        }
        return res.json({
          source: 'ai',
          data: {
            id: Date.now(),
            name: parsedData.name,
            category: parsedData.category || 'AI Analysis',
            calories: Number(parsedData.calories),
            protein: parsedData.protein,
            carbs: parsedData.carbs,
            fats: parsedData.fats,
            healthRating: rating,
            recommendation: parsedData.recommendation
          },
          alternatives
        });
      }
    } catch (parseError) {
      console.error('Failed to parse AI response', parseError, aiResponse);
    }

    // Secondary parsing fallback: if JSON parsing failed, return structured error
    res.status(500).json({ message: 'Unable to parse nutrition information from AI response.' });

  } catch (error) {
    console.error('Nutrition Search Error:', error);
    res.status(500).json({ message: 'Unable to fetch nutrition information.', error: error.message });
  }
};

// Get Meal Suggestions based on local Health Score
export const getMealSuggestions = async (req, res) => {
  try {
    let healthScore = req.query.healthScore !== undefined && req.query.healthScore !== "" ? parseInt(req.query.healthScore) : null;

    if (healthScore === null || isNaN(healthScore)) {
      const startOfToday = getStartOfToday(req);

      // 1. Calculate Sleep Score
      const sleepLog = await SleepLog.findOne({ userId: req.user._id, date: { $gte: startOfToday } }).sort({ date: -1 });
      let sleepScore = 0; // Default if missing is 0
      if (sleepLog) {
        const sleepDuration = sleepLog.duration;
        if (sleepDuration >= 8) sleepScore = 40;
        else if (sleepDuration >= 7) sleepScore = 35;
        else if (sleepDuration >= 6) sleepScore = 25;
        else if (sleepDuration >= 5) sleepScore = 15;
        else sleepScore = 5;
      }

      // 2. Calculate Hydration Score
      const hydrationLogs = await HydrationLog.find({ userId: req.user._id, date: { $gte: startOfToday } });
      const totalWater = hydrationLogs.reduce((acc, log) => acc + log.amount, 0);
      let hydrationScore = 0; // Default if missing is 0
      if (totalWater > 0) {
        if (totalWater >= 2500) hydrationScore = 30;
        else if (totalWater >= 2000) hydrationScore = 25;
        else if (totalWater >= 1500) hydrationScore = 15;
        else if (totalWater >= 1000) hydrationScore = 10;
        else hydrationScore = 5;
      }

      // 3. Calculate Mood Score
      const moodLog = await MoodLog.findOne({ userId: req.user._id, date: { $gte: startOfToday } }).sort({ date: -1 });
      let moodScore = 0; // Default if missing is 0
      if (moodLog) {
        const currentMood = moodLog.mood;
        if (currentMood === 'Happy') moodScore = 30;
        else if (currentMood === 'Calm') moodScore = 25;
        else if (currentMood === 'Neutral') moodScore = 20;
        else if (currentMood === 'Tired') moodScore = 15;
        else if (currentMood === 'Sad') moodScore = 10;
        else if (currentMood === 'Stressed') moodScore = 5;
      }

      healthScore = sleepScore + hydrationScore + moodScore;
    }

    const preference = req.query.preference || 'vegetarian';
    const activePref = preference === 'non-vegetarian' ? 'non-vegetarian' : 'vegetarian';

    const prefData = mealRecommendations[activePref];
    let scoreKey = 'midScore';
    let type = 'moderate';
    let advice = 'Balanced nutrition can further improve your score.';

    if (healthScore === 0) {
      scoreKey = 'lowScore';
      type = 'low';
      advice = 'Start logging sleep, hydration, and mood on the dashboard to calculate meal recommendations.';
    } else if (healthScore >= 80) {
      scoreKey = 'highScore';
      type = 'high';
      advice = 'Your health habits are improving. Stay consistent.';
    } else if (healthScore < 60) {
      scoreKey = 'lowScore';
      type = 'low';
      advice = 'Increase hydration and sleep for better recovery.';
    }

    const categoryData = prefData[scoreKey];
    
    // Random rotation helper
    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const breakfast = getRandomItem(categoryData.breakfast);
    const lunch = getRandomItem(categoryData.lunch);
    const dinner = getRandomItem(categoryData.dinner);

    const suggestions = {
      score: healthScore,
      type,
      breakfast,
      lunch,
      dinner,
      advice
    };

    res.json(suggestions);

  } catch (error) {
    console.error('Meal Suggestions Error:', error);
    res.status(500).json({ message: 'Failed to calculate meal suggestions', error: error.message });
  }
};
