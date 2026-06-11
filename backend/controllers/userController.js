import User from '../models/User.js';

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
