import MoodLog from '../models/MoodLog.js';
import { getStartOfToday } from '../utils/timezone.js';

export const addMood = async (req, res) => {
  try {
    const { mood } = req.body;
    
    if (!mood) {
      return res.status(400).json({ message: 'Mood is required' });
    }

    const log = await MoodLog.create({
      userId: req.user._id,
      mood
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyMood = async (req, res) => {
  try {
    const startOfToday = getStartOfToday(req);
    const log = await MoodLog.findOne({
      userId: req.user._id,
      date: { $gte: startOfToday }
    }).sort({ date: -1 });
    res.json({ log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetToday = async (req, res) => {
  try {
    const startOfToday = getStartOfToday(req);
    await MoodLog.deleteMany({
      userId: req.user._id,
      date: { $gte: startOfToday }
    });
    res.json({ message: 'Today\'s mood progress reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMoodHistory = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const logs = await MoodLog.find({
      userId: req.user._id,
      date: { $gte: lastWeek }
    }).sort({ date: 1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await MoodLog.findOneAndDelete({ _id: id, userId: req.user._id });
    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await MoodLog.deleteMany({ userId: req.user._id });
    res.json({ message: 'All mood history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
