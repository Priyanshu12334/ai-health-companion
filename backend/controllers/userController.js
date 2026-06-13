import User from '../models/User.js';
import HydrationLog from '../models/HydrationLog.js';
import SleepLog from '../models/SleepLog.js';
import MoodLog from '../models/MoodLog.js';

export const onboardUser = async (req, res) => {
  try {
    const { age, gender, height, weight, wakeupTime, bedtime, goals } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
      if (age !== '' && age !== undefined) user.age = Number(age);
      if (gender) user.gender = gender;
      if (height !== '' && height !== undefined) user.height = Number(height);
      if (weight !== '' && weight !== undefined) user.weight = Number(weight);
      if (wakeupTime) user.wakeupTime = wakeupTime;
      if (bedtime) user.bedtime = bedtime;
      if (goals) user.goals = goals;
      user.onboardingCompleted = true;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        onboardingCompleted: updatedUser.onboardingCompleted,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Onboarding Error:', error);
    res.status(500).json({ message: error.message, stack: error.stack, name: error.name });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { dailyWaterGoal, dailySleepGoal, name, email } = req.body;
    
    const user = await User.findById(req.user._id);

    if (user) {
      user.dailyWaterGoal = dailyWaterGoal || user.dailyWaterGoal;
      user.dailySleepGoal = dailySleepGoal || user.dailySleepGoal;
      if (name) user.name = name;
      if (email) user.email = email;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserStreak = async (req, res) => {
  try {
    const timezoneOffset = req.query.timezoneOffset ? parseInt(req.query.timezoneOffset) : 0; // minutes

    // Fetch all log dates
    const hydrationLogs = await HydrationLog.find({ userId: req.user._id }, 'date');
    const sleepLogs = await SleepLog.find({ userId: req.user._id }, 'date');
    const moodLogs = await MoodLog.find({ userId: req.user._id }, 'date');

    // Helper to convert UTC date to user's local YYYY-MM-DD string
    const toLocalDateString = (dateObj) => {
      if (!dateObj) return null;
      const localTime = new Date(dateObj.getTime() - (timezoneOffset * 60000));
      return localTime.toISOString().split('T')[0];
    };

    const hydrationDates = new Set(hydrationLogs.map(log => toLocalDateString(log.date)).filter(Boolean));
    const sleepDates = new Set(sleepLogs.map(log => toLocalDateString(log.date)).filter(Boolean));
    const moodDates = new Set(moodLogs.map(log => toLocalDateString(log.date)).filter(Boolean));

    const fullyLoggedDates = new Set();
    for (const dateStr of hydrationDates) {
      if (sleepDates.has(dateStr) && moodDates.has(dateStr)) {
        fullyLoggedDates.add(dateStr);
      }
    }

    const today = new Date();
    const todayStr = toLocalDateString(today);

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = toLocalDateString(yesterday);

    let streakCount = 0;
    const isTodayLogged = fullyLoggedDates.has(todayStr);
    const isYesterdayLogged = fullyLoggedDates.has(yesterdayStr);

    if (!isTodayLogged && !isYesterdayLogged) {
      streakCount = 0;
    } else {
      let startCheckingFrom = isTodayLogged ? today : yesterday;
      let checkingStr = toLocalDateString(startCheckingFrom);
      
      while (fullyLoggedDates.has(checkingStr)) {
        streakCount++;
        startCheckingFrom = new Date(startCheckingFrom.getTime() - 24 * 60 * 60 * 1000);
        checkingStr = toLocalDateString(startCheckingFrom);
      }
    }

    res.json({
      streak: streakCount,
      isTodayLogged,
      isYesterdayLogged
    });
  } catch (error) {
    console.error('Streak calculation error:', error);
    res.status(500).json({ message: error.message });
  }
};
