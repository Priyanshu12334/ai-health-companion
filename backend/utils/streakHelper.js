import User from '../models/User.js';
import HydrationLog from '../models/HydrationLog.js';
import SleepLog from '../models/SleepLog.js';
import { getTimezoneOffset, getStartOfToday, toLocalDateString } from './timezone.js';

export const updateUserStreak = async (userId, req) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const timezoneOffset = getTimezoneOffset(req);
    const now = new Date();
    
    const todayStr = toLocalDateString(now, timezoneOffset);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = toLocalDateString(yesterday, timezoneOffset);

    // Fetch today's local start of day
    const startOfToday = getStartOfToday(req);

    // Fetch hydration logs since midnight local time
    const hydrationLogs = await HydrationLog.find({
      userId,
      date: { $gte: startOfToday }
    });
    const totalWater = hydrationLogs.reduce((acc, log) => acc + log.amount, 0);

    // Fetch sleep logs since midnight local time
    const sleepLog = await SleepLog.findOne({
      userId,
      date: { $gte: startOfToday }
    }).sort({ date: -1 });
    const sleepDuration = sleepLog ? sleepLog.duration : 0;

    // Goals (use waterGoal and sleepGoal from User schema)
    const waterGoal = user.waterGoal ?? user.dailyWaterGoal ?? 2000;
    const sleepGoal = user.sleepGoal ?? user.dailySleepGoal ?? 8;

    const isTodayCompleted = totalWater >= waterGoal && sleepDuration >= sleepGoal;

    if (isTodayCompleted) {
      if (user.lastCompletedDate === todayStr) {
        // Already completed today, do nothing
      } else if (user.lastCompletedDate === yesterdayStr) {
        // Streak continues, increment
        user.streakCount += 1;
        user.lastCompletedDate = todayStr;
        await user.save();
      } else {
        // Streak started today
        user.streakCount = 1;
        user.lastCompletedDate = todayStr;
        await user.save();
      }
    } else {
      // Today not completed yet.
      // Reset only if yesterday was missed (i.e. lastCompletedDate is not today and is not yesterday)
      if (user.lastCompletedDate && user.lastCompletedDate !== todayStr && user.lastCompletedDate !== yesterdayStr) {
        user.streakCount = 0;
        await user.save();
      }
    }

    return {
      streakCount: user.streakCount,
      lastCompletedDate: user.lastCompletedDate
    };
  } catch (error) {
    console.error('Error in updateUserStreak helper:', error);
    return null;
  }
};
