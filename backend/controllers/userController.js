import User from '../models/User.js';
import HydrationLog from '../models/HydrationLog.js';
import SleepLog from '../models/SleepLog.js';
import MoodLog from '../models/MoodLog.js';
import { updateUserStreak } from '../utils/streakHelper.js';
import { getTimezoneOffset, getStartOfToday, toLocalDateString } from '../utils/timezone.js';

export const onboardUser = async (req, res) => {
  try {
    const {
      age, gender, height, weight,
      dailyWaterGoal, waterGoalUnit, waterGoalDisplay,
      dailySleepGoal, sleepGoal,
      currentMood, goals
    } = req.body;

    const parsedAge = Number(age);
    if (!age || isNaN(parsedAge) || parsedAge <= 0) {
      return res.status(400).json({ message: 'Valid positive age is required' });
    }

    let parsedHeight;
    if (height !== '' && height !== undefined && height !== null) {
      parsedHeight = Number(height);
      if (isNaN(parsedHeight) || parsedHeight <= 0) {
        return res.status(400).json({ message: 'Height must be a valid positive number' });
      }
    }

    let parsedWeight;
    if (weight !== '' && weight !== undefined && weight !== null) {
      parsedWeight = Number(weight);
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        return res.status(400).json({ message: 'Weight must be a valid positive number' });
      }
    }

    // Water goal: normalized value in ml required
    const parsedWater = Number(dailyWaterGoal);
    if (!dailyWaterGoal || isNaN(parsedWater) || parsedWater <= 0) {
      return res.status(400).json({ message: 'Valid positive hydration goal is required' });
    }

    // Sleep goal: required
    const sleepGoalRaw = dailySleepGoal ?? sleepGoal;
    const parsedSleep = Number(sleepGoalRaw);
    if (!sleepGoalRaw || isNaN(parsedSleep) || parsedSleep <= 0) {
      return res.status(400).json({ message: 'Valid positive sleep goal is required' });
    }

    if (!currentMood) {
      return res.status(400).json({ message: 'Current mood is required' });
    }

    if (!goals || !Object.values(goals).some(val => val === true)) {
      return res.status(400).json({ message: 'Please select at least one goal' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.age = parsedAge;
      if (gender) user.gender = gender;
      if (parsedHeight !== undefined) user.height = parsedHeight;
      if (parsedWeight !== undefined) user.weight = parsedWeight;

      // Save water goal — both normalized ml value and display unit/value
      user.dailyWaterGoal = parsedWater;
      user.waterGoal = parsedWater;
      user.waterGoalUnit = waterGoalUnit || 'ml';
      user.waterGoalDisplay = waterGoalDisplay !== undefined ? Number(waterGoalDisplay) : parsedWater;

      // Save sleep goal
      user.dailySleepGoal = parsedSleep;
      user.sleepGoal = parsedSleep;

      user.goals = goals;
      user.onboardingCompleted = true;

      const updatedUser = await user.save();

      // Create initial mood log for today
      if (currentMood) {
        const startOfToday = getStartOfToday(req);
        await MoodLog.create({
          userId: user._id,
          mood: currentMood,
          date: startOfToday
        });
      }

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
    res.status(500).json({ message: error.message });
  }
};


export const updateSettings = async (req, res) => {
  try {
    const { dailyWaterGoal, waterGoalUnit, waterGoalDisplay, dailySleepGoal, name, email } = req.body;
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (dailyWaterGoal !== undefined && dailyWaterGoal !== '') {
      const parsedWater = Number(dailyWaterGoal);
      if (!isNaN(parsedWater) && parsedWater > 0) {
        user.dailyWaterGoal = parsedWater;
        user.waterGoal = parsedWater;
        // Persist display unit & value
        if (waterGoalUnit) user.waterGoalUnit = waterGoalUnit;
        const displayVal = waterGoalDisplay !== undefined ? Number(waterGoalDisplay) : parsedWater;
        if (!isNaN(displayVal) && displayVal > 0) user.waterGoalDisplay = displayVal;
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
      waterGoalUnit: updatedUser.waterGoalUnit,
      waterGoalDisplay: updatedUser.waterGoalDisplay,
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
