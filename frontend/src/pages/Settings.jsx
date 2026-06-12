import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LogOut, User, Target, RotateCcw, Mail, Globe, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Settings = () => {
 const { user, logout, updateUser } = useAuth();
 const [formData, setFormData] = useState({
 name: user?.name || '',
 email: user?.email || '',
 dailyWaterGoal: 2000,
 dailySleepGoal: 8,
 });
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 // Fetch current profile to get goals
 const fetchProfile = async () => {
 try {
 const res = await api.get('/auth/me');
 setFormData({
 name: res.data.name,
 email: res.data.email,
 dailyWaterGoal: res.data.dailyWaterGoal || 2000,
 dailySleepGoal: res.data.dailySleepGoal || 8,
 });
 } catch (error) {
 console.error("Failed to load profile", error);
 }
 };
 fetchProfile();
 }, []);

 const handleSave = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 const res = await api.put('/user/settings', formData);
 // Sync AuthContext + localStorage so Dashboard/header updates instantly
 updateUser({
 name: formData.name,
 email: formData.email,
 });
 toast.success('Settings updated successfully');
 } catch (error) {
 toast.error('Failed to update settings');
 } finally {
 setLoading(false);
 }
 };

  const resetAnalytics = async (type) => {
    if (!window.confirm(`Are you sure you want to reset ${type} analytics? This cannot be undone.`)) return;
    try {
      if (type === 'all' || type === 'hydration') await api.delete('/hydration/clear');
      if (type === 'all' || type === 'sleep') await api.delete('/sleep/clear');
      if (type === 'all' || type === 'mood') await api.delete('/mood/clear');
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} analytics reset successfully`);
    } catch (error) {
      toast.error(`Failed to reset ${type} analytics`);
    }
  };

 return (
 <div className="space-y-6 max-w-2xl mx-auto w-full pb-8">
 <h2 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="text-text-secondary"/> Settings</h2>
 
 <div className="glass-card overflow-hidden">
 <form onSubmit={handleSave} className="p-6 space-y-6 border-b border-border-color">
 <div>
 <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border-color pb-2"><User className="w-5 h-5 text-sky-600" /> Account Profile</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1">Name</label>
 <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Email</label>
 <input type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border-color pb-2"><Target className="w-5 h-5 text-emerald-500" /> Daily Goals</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1">Water Goal (ml)</label>
 <input type="number" className="input-field" value={formData.dailyWaterGoal} onChange={(e) => setFormData({...formData, dailyWaterGoal: Number(e.target.value)})} required />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Sleep Goal (hours)</label>
 <input type="number" step="0.5" className="input-field" value={formData.dailySleepGoal} onChange={(e) => setFormData({...formData, dailySleepGoal: Number(e.target.value)})} required />
 </div>
 </div>
 </div>

 <div className="pt-2 flex justify-end">
 <button type="submit" disabled={loading} className="btn-sky w-auto px-8">
 {loading ? 'Saving...' : 'Save Changes'}
 </button>
 </div>
 </form>

  <div className="p-6 border-b border-border-color">
    <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><RotateCcw className="w-5 h-5 text-orange-500" /> Analytics Reset</h3>
    <p className="text-sm text-text-secondary mb-4">Permanently clear your historical data for specific modules.</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button onClick={() => resetAnalytics('hydration')} className="p-3 border border-border-color rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
        Reset Hydration
      </button>
      <button onClick={() => resetAnalytics('sleep')} className="p-3 border border-border-color rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
        Reset Sleep
      </button>
      <button onClick={() => resetAnalytics('mood')} className="p-3 border border-border-color rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
        Reset Mood
      </button>
      <button onClick={() => resetAnalytics('all')} className="p-3 bg-red-100 text-red-600 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors">
        Reset All Analytics
      </button>
    </div>
  </div>
  <div className="p-6 border-b border-border-color">
    <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Mail className="w-5 h-5 text-indigo-500" /> Contact Us</h3>
    <p className="text-sm text-text-secondary mb-4">For feedback, feature requests, collaboration opportunities, or technical support, feel free to get in touch.</p>
    
    <div className="bg-surface rounded-xl p-5 border border-border-color space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-text-secondary mb-1">Developer</h4>
        <p className="font-medium text-lg">Priyanshu Suyal</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <a href="mailto:suyalpriyanshu2@gmail.com" className="flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-background transition-colors border border-border-color shadow-sm text-sm font-medium flex-1">
          <Mail className="w-4 h-4 text-sky-500" />
          Email
        </a>
        
        <a href="https://www.linkedin.com/in/priyanshu-suyal-5732b224a/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-background transition-colors border border-border-color shadow-sm text-sm font-medium flex-1">
          <Globe className="w-4 h-4 text-blue-600" />
          LinkedIn
        </a>
        
        <a href="https://github.com/Priyanshu12334" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-background transition-colors border border-border-color shadow-sm text-sm font-medium flex-1">
          <Code className="w-4 h-4 text-gray-800 dark:text-gray-300" />
          GitHub
        </a>
      </div>
      
      <div className="pt-4 mt-4 border-t border-border-color">
        <p className="text-sm text-center text-text-secondary font-medium">&copy; 2026 AI Health Companion. All Rights Reserved.</p>
      </div>
    </div>
  </div>
 <div className="p-6 bg-red-50 dark:bg-red-900/10">
 <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
 <p className="text-sm text-red-500/80 mb-4">Logging out will end your current session.</p>
 <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors font-medium">
 <LogOut className="w-4 h-4" /> Log Out
 </button>
 </div>
 </div>
 </div>
 );
};

export default Settings;
