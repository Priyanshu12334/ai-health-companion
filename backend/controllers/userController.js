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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (dailyWaterGoal !== undefined && dailyWaterGoal !== '') {
      const parsedWater = Number(dailyWaterGoal);
      if (!isNaN(parsedWater) && parsedWater > 0) {
        user.dailyWaterGoal = parsedWater;
        user.waterGoal = parsedWater;
      }
    }

    if (dailySleepGoal !== undefined && dailySleepGoal !== '') {
      const parsedSleep = Number(dailySleepGoal);
      if (!isNaN(parsedSleep) && parsedSleep > 0) {
        user.dailySleepGoal = parsedSleep;
        user.sleepGoal = parsedSleep;
      }
    }

    if (name && name.trim() !== '') {
      user.name = name.trim();
    }

    if (email && email.trim() !== '') {
      const formattedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formattedEmail)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }

      if (formattedEmail !== user.email.toLowerCase()) {
        const emailExists = await User.findOne({ 
          email: formattedEmail, 
          _id: { $ne: user._id } 
        });

        if (emailExists) {
          return res.status(409).json({ message: 'Email address is already in use' });
        }

        user.email = formattedEmail;
      }
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      dailyWaterGoal: updatedUser.dailyWaterGoal,
      dailySleepGoal: updatedUser.dailySleepGoal,
      waterGoal: updatedUser.waterGoal,
      sleepGoal: updatedUser.sleepGoal,
      onboardingCompleted: updatedUser.onboardingCompleted,
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email address is already in use' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Failed to update settings' });
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
