import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  goals: {
    improveHydration: { type: Boolean, default: false },
    betterSleep: { type: Boolean, default: false },
    improveMood: { type: Boolean, default: false },
    improveNutrition: { type: Boolean, default: false },
    buildHealthyHabits: { type: Boolean, default: false },
    improveEnergyLevels: { type: Boolean, default: false },
    trackOverallWellness: { type: Boolean, default: false }
  },
  wakeupTime: { type: String }, // e.g. "07:00"
  bedtime: { type: String }, // e.g. "23:00"
  onboardingCompleted: { type: Boolean, default: false },
  dailyWaterGoal: { type: Number, default: 2000 }, // in ml (normalized)
  dailySleepGoal: { type: Number, default: 8 }, // in hours
  waterGoal: { type: Number, default: 2000 }, // in ml (normalized)
  waterGoalUnit: { type: String, default: 'ml' }, // "L" or "ml" — user-selected display unit
  waterGoalDisplay: { type: Number, default: 2000 }, // user-entered display value (e.g. 4 when unit is L)
  sleepGoal: { type: Number, default: 8 }, // in hours
  streakCount: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: "" }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
