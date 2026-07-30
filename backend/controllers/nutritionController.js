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
      return res.status(404).json({ message: `No nutrition information found for "${q}".` });
    }

    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    const systemPrompt = `You are a nutrition assistant.
Analyze the food item requested by the user.
Return a JSON object with top-level keys:
- "name": Food Name (string)
- "calories": number (e.g. 250)
- "protein": string or number (e.g. "8g" or 8)
- "carbs": string or number (e.g. "40g" or 40)
- "fats": string or number (e.g. "10g" or 10)
- "healthRating": number (1 to 10)
- "recommendation": concise recommendation under 15 words

Return ONLY valid JSON. Do not include markdown code blocks or explanations.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Provide nutrition info for: ${q}` }
        ],
        temperature: 0.1,
        max_tokens: 600,
        response_format: { type: "json_object" }
      });

      const aiResponse = completion.choices[0]?.message?.content || "";

      // Flexible JSON extraction
      let cleanText = aiResponse.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      const parsedData = JSON.parse(cleanText);

      const formatMacro = (val) => {
        if (val === undefined || val === null) return "0g";
        const str = String(val).trim();
        if (!str) return "0g";
        return str.toLowerCase().endsWith('g') ? str : `${str}g`;
      };

      const name = parsedData.name || parsedData.product || parsedData.foodName || q;
      const calories = parsedData.calories !== undefined 
        ? Number(parsedData.calories) 
        : (parsedData.nutritionPerServing?.calories ? Number(parsedData.nutritionPerServing.calories) : 100);
      
      const protein = formatMacro(parsedData.protein || parsedData.protein_g || parsedData.nutritionPerServing?.protein_g);
      const carbs = formatMacro(parsedData.carbs || parsedData.carbohydrate_g || parsedData.carbohydrates || parsedData.nutritionPerServing?.carbohydrate_g);
      const fats = formatMacro(parsedData.fats || parsedData.fat || parsedData.totalFat_g || parsedData.nutritionPerServing?.totalFat_g);
      
      const rawRating = parsedData.healthRating !== undefined ? parsedData.healthRating : 5;
      const healthRating = Math.max(1, Math.min(10, Math.round(Number(rawRating) || 5)));
      
      const recommendation = parsedData.recommendation || "Consume in moderation as part of a balanced diet.";

      let alternatives = [];
      if (healthRating < 7) {
        alternatives = nutritionDb
          .filter(item => item.category === "Healthy Snacks")
          .slice(0, 3);
      }

      return res.json({
        source: 'ai',
        data: {
          id: Date.now(),
          name,
          category: parsedData.category || 'AI Analysis',
          calories: isNaN(calories) ? 100 : calories,
          protein,
          carbs,
          fats,
          healthRating,
          recommendation
        },
        alternatives
      });
    } catch (parseOrAiError) {
      console.error('Nutrition AI Error / Parsing Error:', parseOrAiError);
      return res.status(404).json({ message: `Unable to find nutrition information for "${q}". Please try another search term.` });
    }
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
      const user = await User.findById(req.user._id);
      const hydrationGoal = user?.dailyWaterGoal || 2000;
      const hydrationLogs = await HydrationLog.find({ userId: req.user._id, date: { $gte: startOfToday } });
      const totalWater = hydrationLogs.reduce((acc, log) => acc + log.amount, 0);
      let hydrationScore = 0; // Default if missing is 0
      if (totalWater > 0) {
        if (totalWater >= hydrationGoal) hydrationScore = 30;
        else if (totalWater >= hydrationGoal * 0.75) hydrationScore = 25;
        else if (totalWater >= hydrationGoal * 0.5) hydrationScore = 15;
        else if (totalWater >= hydrationGoal * 0.25) hydrationScore = 10;
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
