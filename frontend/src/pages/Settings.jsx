import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LogOut, User, Target, RotateCcw, Mail, Globe, Code, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Settings = () => {
 const { user, logout, updateUser } = useAuth();
 const { clearCache } = useData();
 
 const handleLogout = () => {
   clearCache();
   logout();
 };

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
        name: res.data.name || formData.name,
        email: res.data.email || formData.email,
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
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
 <label className="block text-sm font-medium mb-1">Sleep Goal(hours)</label>
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
      <button onClick={() => resetAnalytics('hydration')} className="p-3 border border-border-color rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
        Reset Hydration
      </button>
      <button onClick={() => resetAnalytics('sleep')} className="p-3 border border-border-color rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
        Reset Sleep
      </button>
      <button onClick={() => resetAnalytics('mood')} className="p-3 border border-border-color rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
        Reset Mood
      </button>
      <button onClick={() => resetAnalytics('all')} className="p-3 bg-red-100 text-red-600 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors cursor-pointer">
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
          <svg className="w-4 h-4 text-[#0A66C2] fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
          LinkedIn
        </a>
        
        <a href="https://github.com/Priyanshu12334" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-background transition-colors border border-border-color shadow-sm text-sm font-medium flex-1">
          <svg className="w-4 h-4 text-slate-800 dark:text-slate-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
        
        <a href="https://portfolio-ten-blond-87.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-background transition-colors border border-border-color shadow-sm text-sm font-medium flex-1">
          <ExternalLink className="w-4 h-4 text-blue-600" />
          Portfolio
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
 <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors font-medium cursor-pointer">
 <LogOut className="w-4 h-4" /> Log Out
 </button>
 </div>
 </div>
 </div>
 );
};

export default Settings;
