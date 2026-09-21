import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const GOAL_LABELS = {
  improveHydration: 'Improve Hydration',
  betterSleep: 'Better Sleep',
  improveMood: 'Improve Mood',
  improveNutrition: 'Improve Nutrition',
  buildHealthyHabits: 'Build Healthy Habits',
  trackOverallWellness: 'Track Overall Wellness',
};

const ONBOARDING_MOODS = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Neutral', emoji: '😐' },
  { name: 'Sad', emoji: '😔' },
  { name: 'Tired', emoji: '😴' },
  { name: 'Stressed', emoji: '😫' },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    hydrationGoalVal: '2.5',
    hydrationGoalUnit: 'L',
    sleepGoal: '8',
    currentMood: '',
    goals: {
      improveHydration: false,
      betterSleep: false,
      improveMood: false,
      improveNutrition: false,
      buildHealthyHabits: false,
      trackOverallWellness: false,
    }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateOnboarding } = useAuth();

  const handleGoalToggle = (goalKey) => {
    setFormData(prev => ({
      ...prev,
      goals: { ...prev.goals, [goalKey]: !prev.goals[goalKey] }
    }));
    if (errors.goals) {
      setErrors(prev => ({ ...prev, goals: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    const ageNum = Number(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum <= 0) {
      newErrors.age = 'Age is required and must be a valid positive number.';
    }
    if (formData.height !== '' && formData.height !== undefined && formData.height !== null) {
      const heightNum = Number(formData.height);
      if (isNaN(heightNum) || heightNum <= 0) {
        newErrors.height = 'Height must be a valid positive number.';
      }
    }
    if (formData.weight !== '' && formData.weight !== undefined && formData.weight !== null) {
      const weightNum = Number(formData.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        newErrors.weight = 'Weight must be a valid positive number.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const hydroVal = Number(formData.hydrationGoalVal);
    if (!formData.hydrationGoalVal || isNaN(hydroVal) || hydroVal <= 0) {
      newErrors.hydrationGoal = 'Daily hydration goal must be a valid positive number.';
    }
    const sleepVal = Number(formData.sleepGoal);
    if (!formData.sleepGoal || isNaN(sleepVal) || sleepVal <= 0) {
      newErrors.sleepGoal = 'Daily sleep goal must be a valid positive number.';
    }
    if (!formData.currentMood) {
      newErrors.currentMood = 'Please select how you are feeling today.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    const hasSelectedGoal = Object.values(formData.goals).some(val => val === true);
    if (!hasSelectedGoal) {
      newErrors.goals = 'Please select at least one goal.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setErrors({});
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    if (validateStep2()) {
      setErrors({});
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const hydroVal = Number(formData.hydrationGoalVal);
      const waterGoalInMl = formData.hydrationGoalUnit === 'L' ? hydroVal * 1000 : hydroVal;
      const sleepGoalNum = Number(formData.sleepGoal);

      const payload = {
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        dailyWaterGoal: waterGoalInMl,        // always in ml (normalized)
        waterGoal: waterGoalInMl,             // always in ml (normalized)
        waterGoalUnit: formData.hydrationGoalUnit,  // "L" or "ml" — user-selected
        waterGoalDisplay: hydroVal,           // raw user-entered numeric value
        dailySleepGoal: sleepGoalNum,
        sleepGoal: sleepGoalNum,
        currentMood: formData.currentMood,
        goals: formData.goals,
      };

      await api.post('/user/onboard', payload);
      updateOnboarding(true);
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save profile. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        className="max-w-xl w-full glass-card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Let's get to know you</h2>
            <p className="text-text-secondary">Personalize your Wellora experience.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input 
                  type="number" 
                  className={`input-field ${errors.age ? 'border-rose-500 focus:ring-rose-500' : ''}`} 
                  placeholder="e.g. 25"
                  value={formData.age} 
                  onChange={(e) => {
                    setFormData({...formData, age: e.target.value});
                    if (errors.age) setErrors({...errors, age: null});
                  }} 
                />
                {errors.age && <p className="text-rose-500 text-xs font-medium mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select 
                  className={`input-field ${errors.gender ? 'border-rose-500 focus:ring-rose-500' : ''}`} 
                  value={formData.gender} 
                  onChange={(e) => {
                    setFormData({...formData, gender: e.target.value});
                    if (errors.gender) setErrors({...errors, gender: null});
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-rose-500 text-xs font-medium mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  className={`input-field ${errors.height ? 'border-rose-500 focus:ring-rose-500' : ''}`} 
                  placeholder="e.g. 175"
                  value={formData.height} 
                  onChange={(e) => {
                    setFormData({...formData, height: e.target.value});
                    if (errors.height) setErrors({...errors, height: null});
                  }} 
                />
                {errors.height && <p className="text-rose-500 text-xs font-medium mt-1">{errors.height}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  className={`input-field ${errors.weight ? 'border-rose-500 focus:ring-rose-500' : ''}`} 
                  placeholder="e.g. 70"
                  value={formData.weight} 
                  onChange={(e) => {
                    setFormData({...formData, weight: e.target.value});
                    if (errors.weight) setErrors({...errors, weight: null});
                  }} 
                />
                {errors.weight && <p className="text-rose-500 text-xs font-medium mt-1">{errors.weight}</p>}
              </div>
            </div>
            <button className="btn-sky mt-6 cursor-pointer" onClick={handleNextStep1}>Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Your Routine</h2>
              <p className="text-text-secondary mt-1">Set your daily goals and log your current mood.</p>
            </div>

            {/* 1. Daily Hydration Goal */}
            <div>
              <label className="block text-sm font-medium mb-0.5">Daily Hydration Goal</label>
              <p className="text-text-secondary text-xs mb-2">How much water do you aim to drink each day?</p>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.1"
                  placeholder="2.5" 
                  className={`input-field flex-1 ${errors.hydrationGoal ? 'border-rose-500 focus:ring-rose-500' : ''}`} 
                  value={formData.hydrationGoalVal} 
                  onChange={(e) => {
                    setFormData({...formData, hydrationGoalVal: e.target.value});
                    if (errors.hydrationGoal) setErrors({...errors, hydrationGoal: null});
                  }} 
                />
                <select 
                  className="input-field w-32 shrink-0 cursor-pointer" 
                  value={formData.hydrationGoalUnit} 
                  onChange={(e) => setFormData({...formData, hydrationGoalUnit: e.target.value})}
                >
                  <option value="L">Liters (L)</option>
                  <option value="ml">Milliliters (ml)</option>
                </select>
              </div>
              {errors.hydrationGoal && <p className="text-rose-500 text-xs font-medium mt-1">{errors.hydrationGoal}</p>}
            </div>

            {/* 2. Daily Sleep Goal */}
            <div>
              <label className="block text-sm font-medium mb-0.5">Daily Sleep Goal</label>
              <p className="text-text-secondary text-xs mb-2">How many hours of sleep do you target per night?</p>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="0.5" 
                  min="0.5"
                  max="24"
                  placeholder="8" 
                  className={`input-field flex-1 ${errors.sleepGoal ? 'border-rose-500 focus:ring-rose-500' : ''}`} 
                  value={formData.sleepGoal} 
                  onChange={(e) => {
                    setFormData({...formData, sleepGoal: e.target.value});
                    if (errors.sleepGoal) setErrors({...errors, sleepGoal: null});
                  }} 
                />
                <span className="text-sm font-semibold text-text-secondary px-3 py-2 bg-surface border border-border-color rounded-xl shrink-0">
                  Hours
                </span>
              </div>
              {errors.sleepGoal && <p className="text-rose-500 text-xs font-medium mt-1">{errors.sleepGoal}</p>}
            </div>

            {/* 3. Current Mood */}
            <div>
              <label className="block text-sm font-medium mb-2">How are you feeling today?</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {ONBOARDING_MOODS.map((m) => {
                  const isSelected = formData.currentMood === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, currentMood: m.name});
                        if (errors.currentMood) setErrors({...errors, currentMood: null});
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-sm font-medium cursor-pointer ${
                        isSelected 
                          ? 'bg-sky-600 text-white font-bold border-sky-600 shadow-sm' 
                          : 'bg-surface text-text-primary border-border-color hover:border-sky-400'
                      }`}
                    >
                      <span className="text-lg leading-none">{m.emoji}</span>
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
              {errors.currentMood && <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.currentMood}</p>}
            </div>

            <div className="flex gap-4 mt-6">
              <button className="btn-sky bg-surface hover:bg-surface text-text-sky shadow-none cursor-pointer" onClick={() => { setErrors({}); setStep(1); }}>Back</button>
              <button className="btn-sky cursor-pointer" onClick={handleNextStep2}>Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What are your goals?</h2>
            <p className="text-text-secondary">Select all that apply to get personalized insights.</p>
            
            {errors.goals && (
              <p className="text-rose-500 text-xs font-semibold p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                {errors.goals}
              </p>
            )}

            <div className="space-y-3">
              {Object.keys(GOAL_LABELS).map((goalKey) => (
                <label key={goalKey} className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-background transition-colors border-border-color">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    checked={!!formData.goals[goalKey]}
                    onChange={() => handleGoalToggle(goalKey)}
                  />
                  <span className="ml-3 font-medium">{GOAL_LABELS[goalKey]}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <button className="btn-sky bg-surface hover:bg-surface text-text-sky shadow-none cursor-pointer" onClick={() => { setErrors({}); setStep(2); }}>Back</button>
              <button className="btn-sky cursor-pointer" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
