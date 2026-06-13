import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Onboarding = () => {
 const [step, setStep] = useState(1);
 const [formData, setFormData] = useState({
 age: '',
 gender: 'Other',
 height: '',
 weight: '',
 wakeupTime: '07:00',
 bedtime: '23:00',
 goals: {
 improveHydration: false,
 betterSleep: false,
 buildHealthyHabits: false,
 improveEnergyLevels: false,
 improveConsistency: false,
 }
 });
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
 const { updateOnboarding } = useAuth();

 const handleGoalToggle = (goal) => {
 setFormData(prev => ({
 ...prev,
 goals: { ...prev.goals, [goal]: !prev.goals[goal] }
 }));
 };

 const handleSubmit = async () => {
 setLoading(true);
 try {
 await api.post('/user/onboard', formData);
 updateOnboarding(true);
 toast.success('Profile created successfully!');
 navigate('/dashboard');
 } catch (error) {
 toast.error('Failed to save profile. Please try again.');
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
 <input type="number" className="input-field" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Gender</label>
 <select className="input-field" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
 <option value="Male">Male</option>
 <option value="Female">Female</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Height (cm)</label>
 <input type="number" className="input-field" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Weight (kg)</label>
 <input type="number" className="input-field" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
 </div>
 </div>
 <button className="btn-sky mt-6" onClick={() => setStep(2)}>Next Step</button>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-6">
 <h2 className="text-2xl font-bold">Your Routine</h2>
 <p className="text-text-secondary">When do you usually start and end your day?</p>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1">Wake up time</label>
 <input type="time" className="input-field" value={formData.wakeupTime} onChange={(e) => setFormData({...formData, wakeupTime: e.target.value})} />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Bedtime</label>
 <input type="time" className="input-field" value={formData.bedtime} onChange={(e) => setFormData({...formData, bedtime: e.target.value})} />
 </div>
 </div>
 <div className="flex gap-4 mt-6">
 <button className="btn-sky bg-surface hover:bg-surface text-text-sky shadow-none" onClick={() => setStep(1)}>Back</button>
 <button className="btn-sky" onClick={() => setStep(3)}>Next Step</button>
 </div>
 </div>
 )}

 {step === 3 && (
 <div className="space-y-6">
 <h2 className="text-2xl font-bold">What are your goals?</h2>
 <p className="text-text-secondary">Select all that apply to get personalized insights.</p>
 <div className="space-y-3">
 {Object.keys(formData.goals).map((goal) => (
 <label key={goal} className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-background transition-colors border-border-color">
 <input 
 type="checkbox" 
 className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
 checked={formData.goals[goal]}
 onChange={() => handleGoalToggle(goal)}
 />
 <span className="ml-3 font-medium capitalize">{goal.replace(/([A-Z])/g, ' $1').trim()}</span>
 </label>
 ))}
 </div>
 <div className="flex gap-4 mt-6">
 <button className="btn-sky bg-surface hover:bg-surface text-text-sky shadow-none" onClick={() => setStep(2)}>Back</button>
 <button className="btn-sky" onClick={handleSubmit} disabled={loading}>
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
