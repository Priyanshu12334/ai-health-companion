import HydrationLog from '../models/HydrationLog.js';
import User from '../models/User.js';

export const addHydration = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const log = await HydrationLog.create({
      userId: req.user._id,
      amount
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyHydration = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await HydrationLog.find({
      userId: req.user._id,
      date: { $gte: today }
    });

    const total = logs.reduce((acc, log) => acc + log.amount, 0);
    const user = await User.findById(req.user._id);

    res.json({
      logs,
      total,
      goal: user.dailyWaterGoal || 2000
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyHydration = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const logs = await HydrationLog.aggregate([
      { $match: { userId: req.user._id, date: { $gte: lastWeek } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await HydrationLog.deleteMany({
      userId: req.user._id,
      date: { $gte: today }
    });

    res.json({ message: 'Today\'s hydration logs reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await HydrationLog.deleteMany({ userId: req.user._id });
    res.json({ message: 'All hydration history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
