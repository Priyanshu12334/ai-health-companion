import User from '../models/User.js';
import HydrationLog from '../models/HydrationLog.js';
import SleepLog from '../models/SleepLog.js';
import MoodLog from '../models/MoodLog.js';
import { getStartOfToday } from './timezone.js';

export const getDailyWellnessData = async (userId, req) => {
  const startOfToday = getStartOfToday(req);
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const [user, hydrationLogs, dailySleepLogs, moodLog] = await Promise.all([
    User.findById(userId),
    HydrationLog.find({ userId, date: { $gte: startOfToday } }),
    SleepLog.find({ userId, date: { $gte: startOfToday, $lt: endOfToday } }).sort({ date: -1 }),
    MoodLog.findOne({ userId, date: { $gte: startOfToday } }).sort({ date: -1 })
  ]);

  const totalWater = hydrationLogs.reduce((acc, log) => acc + log.amount, 0);
  const waterGoal = user?.waterGoal ?? user?.dailyWaterGoal ?? 2000;
  const sleepDuration = dailySleepLogs.reduce((total, log) => total + log.duration, 0);
  const sleepGoal = user?.sleepGoal ?? user?.dailySleepGoal ?? 8;
  const currentMood = moodLog ? moodLog.mood : null;

  // Sleep Score (0-40)
  let sleepScore = 0;
  if (dailySleepLogs.length > 0) {
    if (sleepDuration >= 8) sleepScore = 40;
    else if (sleepDuration >= 7) sleepScore = 35;
    else if (sleepDuration >= 6) sleepScore = 25;
    else if (sleepDuration >= 5) sleepScore = 15;
    else sleepScore = 5;
  }

  // Hydration Score (0-30)
  let hydrationScore = 0;
  if (hydrationLogs.length > 0 && totalWater > 0) {
    if (totalWater >= waterGoal) hydrationScore = 30;
    else if (totalWater >= waterGoal * 0.75) hydrationScore = 25;
    else if (totalWater >= waterGoal * 0.5) hydrationScore = 15;
    else if (totalWater >= waterGoal * 0.25) hydrationScore = 10;
    else hydrationScore = 5;
  }

  // Mood Score (0-30)
  let moodScore = 0;
  if (currentMood) {
    if (currentMood === 'Happy') moodScore = 30;
    else if (currentMood === 'Calm') moodScore = 25;
    else if (currentMood === 'Neutral') moodScore = 20;
    else if (currentMood === 'Tired') moodScore = 15;
    else if (currentMood === 'Sad') moodScore = 10;
    else if (currentMood === 'Stressed') moodScore = 5;
  }

  const healthScore = sleepScore + hydrationScore + moodScore;

  return {
    healthScore,
    sleepScore,
    hydrationScore,
    moodScore,
    totalWater,
    waterGoal,
    sleepDuration,
    sleepGoal,
    currentMood,
    sleepQuality: dailySleepLogs[0]?.quality || 'Good'
  };
};
