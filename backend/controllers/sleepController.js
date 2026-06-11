import SleepLog from '../models/SleepLog.js';
import User from '../models/User.js';

export const addSleep = async (req, res) => {
  try {
    const { bedtime, wakeupTime, quality } = req.body;

    const bed = new Date(bedtime);
    const wake = new Date(wakeupTime);
    
    const duration = (wake - bed) / (1000 * 60 * 60); // in hours

    if (duration <= 0) {
      return res.status(400).json({ message: 'Wake time must be after bedtime.' });
    }

    if (duration > 24) {
      return res.status(400).json({ message: 'Sleep duration cannot exceed 24 hours.' });
    }

    const log = await SleepLog.create({
      userId: req.user._id,
      bedtime: bed,
      wakeupTime: wake,
      duration,
      quality: quality || 'Good'
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailySleep = async (req, res) => {
  try {
    const log = await SleepLog.findOne({ userId: req.user._id }).sort({ date: -1 });
    const user = await User.findById(req.user._id);

    res.json({
      log,
      goal: user.dailySleepGoal || 8
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklySleep = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const logs = await SleepLog.find({
      userId: req.user._id,
      date: { $gte: lastWeek }
    }).sort({ date: 1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await SleepLog.deleteMany({
      userId: req.user._id,
      date: { $gte: today }
    });

    res.json({ message: 'Today\'s sleep log reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await SleepLog.deleteMany({ userId: req.user._id });
    res.json({ message: 'All sleep history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
