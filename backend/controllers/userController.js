import User from '../models/User.js';
import HydrationLog from '../models/HydrationLog.js';
import SleepLog from '../models/SleepLog.js';
import MoodLog from '../models/MoodLog.js';
import { updateUserStreak } from '../utils/streakHelper.js';
import { getTimezoneOffset, toLocalDateString } from '../utils/timezone.js';

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
      user.waterGoal = dailyWaterGoal || user.waterGoal;
      user.sleepGoal = dailySleepGoal || user.sleepGoal;
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
    const result = await updateUserStreak(req.user._id, req);
    if (!result) {
      return res.status(400).json({ message: 'Failed to update streak' });
    }

    const user = await User.findById(req.user._id);
    const timezoneOffset = getTimezoneOffset(req);
    const now = new Date();
    const todayStr = toLocalDateString(now, timezoneOffset);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = toLocalDateString(yesterday, timezoneOffset);

    res.json({
      streak: user.streakCount,
      isTodayLogged: user.lastCompletedDate === todayStr,
      isYesterdayLogged: user.lastCompletedDate === yesterdayStr
    });
  } catch (error) {
    console.error('Streak calculation error:', error);
    res.status(500).json({ message: error.message });
  }
};
