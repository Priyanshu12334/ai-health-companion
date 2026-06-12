import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Moon, Smile, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { moodMap } from '../utils/moodConfig';

const Dashboard = () => {
 const { user } = useAuth();
 const [data, setData] = useState({
 hydration: { total: 0, goal: 2000 },
 sleep: { log: null, goal: 8 },
 mood: { log: null }
 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchDashboardData = async () => {
 try {
 const [hydroRes, sleepRes, moodRes] = await Promise.all([
 api.get('/hydration'),
 api.get('/sleep'),
 api.get('/mood')
 ]);
 
 setData({
 hydration: hydroRes.data,
 sleep: sleepRes.data,
 mood: moodRes.data
 });
 } catch (error) {
 console.error("Failed to fetch dashboard data", error);
 } finally {
 setLoading(false);
 }
 };
 fetchDashboardData();
 }, []);

 const hydrationPercent = Math.min((data.hydration.total / data.hydration.goal) * 100, 100);

 const achievements = [];
 if (data.hydration.total > 0 && data.hydration.total >= data.hydration.goal) achievements.push({ id: 1, title: 'Hydration Goal Completed', icon: '💧' });
 if (data.sleep.log && data.sleep.log.duration >= data.sleep.goal) achievements.push({ id: 2, title: 'Sleep Goal', icon: '😴' });
 if (data.mood.log) achievements.push({ id: 3, title: 'Mood Logged', icon: '😊' });

 const displayName =
    user?.name ||
    (() => { try { return JSON.parse(localStorage.getItem('auroraUser'))?.name; } catch { return null; } })() ||
    'User';

 return (
 <div className="space-y-6">
 <header className="mb-8">
 <motion.h1 
 className="text-3xl md:text-4xl font-bold"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 >
 Hello {displayName.split(' ')[0]},
 </motion.h1>
 <motion.p 
 className="text-text-secondary mt-1"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.1 }}
 >
 Let's make today healthier.
 </motion.p>
 </header>

 {achievements.length > 0 && (
 <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
 {achievements.map((ach) => (
 <motion.div 
 key={ach.id}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-full whitespace-nowrap text-sm font-bold shadow-sm"
 >
 <span>{ach.icon}</span> {ach.title}
 </motion.div>
 ))}
 </div>
 )}

 <motion.div 
 className="glass-card p-6 bg-sky-600 from-sky-500 to-sky-600 text-white relative overflow-hidden"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 >
 <div className="absolute top-0 right-0 p-6 opacity-20">
 <Sparkles className="w-24 h-24" />
 </div>
 <div className="relative z-10 flex gap-4">
 <div className="p-3 bg-card/20 rounded-3xl shrink-0 h-fit">
 <Sparkles className="w-6 h-6 text-yellow-300" />
 </div>
 <div>
 <h3 className="text-lg font-bold mb-1">AI Insight</h3>
 <p className="text-white/90 text-sm md:text-base leading-relaxed">
 {data.hydration.total < data.hydration.goal * 0.5 
 ?"You are behind your hydration goal today. Drinking more water now will improve your energy levels later." 
 :"You are doing great today! Keep up the consistency."}
 </p>
 <Link to="/ai-chat" className="inline-block mt-3 text-sm font-bold bg-card/20 hover:bg-card/30 px-4 py-1.5 rounded-full transition-colors">
 Chat with Aurora &rarr;
 </Link>
 </div>
 </div>
 </motion.div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <Link to="/hydration">
 <motion.div 
 className="glass-card p-6 hover:-translate-y-1 transition-transform cursor-pointer h-full"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 >
 <div className="flex items-center justify-between mb-4">
 <div className="p-3 text-sky-600 dark:text-sky-600 rounded-xl">
 <Droplets className="w-6 h-6" />
 </div>
 <span className="text-sm font-medium text-text-secondary">{Math.round(hydrationPercent)}%</span>
 </div>
 <h3 className="font-bold text-lg">Hydration</h3>
 <p className="text-2xl font-bold mt-1">{data.hydration.total} <span className="text-sm font-normal text-text-secondary">/ {data.hydration.goal} ml</span></p>
 <div className="w-full bg-surface rounded-full h-2 mt-4 overflow-hidden">
 <div className="bg-sky-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${hydrationPercent}%` }}></div>
 </div>
 </motion.div>
 </Link>

 <Link to="/sleep">
 <motion.div 
 className="glass-card p-6 hover:-translate-y-1 transition-transform cursor-pointer h-full"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 >
 <div className="flex items-center justify-between mb-4">
 <div className="p-3 text-sky-600 dark:text-sky-600 rounded-xl">
 <Moon className="w-6 h-6" />
 </div>
 <span className="text-sm font-medium text-text-secondary">
 {data.sleep.log?.quality || 'No Data'}
 </span>
 </div>
 <h3 className="font-bold text-lg">Sleep</h3>
 <p className="text-2xl font-bold mt-1">
 {data.sleep.log ? data.sleep.log.duration.toFixed(1) : '0'} <span className="text-sm font-normal text-text-secondary">/ {data.sleep.goal} hrs</span>
 </p>
 <p className="text-sm text-text-secondary mt-4 border-t border-border-color pt-3">
 Last night's sleep
 </p>
 </motion.div>
 </Link>

 <Link to="/mood">
 <motion.div 
 className="glass-card p-6 hover:-translate-y-1 transition-transform cursor-pointer h-full"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.5 }}
 >
 {(() => {
 const currentMoodObj = data.mood.log ? moodMap[data.mood.log.mood] : null;
 return (
 <>
 <div className="flex items-center justify-between mb-4">
 <div className={`p-3 rounded-xl flex items-center justify-center w-12 h-12 ${currentMoodObj ? currentMoodObj + ' ' + currentMoodObj.textColor : 'bg-surface text-text-secondary'}`}>
 {currentMoodObj ? <span className="text-2xl leading-none">{currentMoodObj.emoji}</span> : <Smile className="w-6 h-6" />}
 </div>
 </div>
 <h3 className="font-bold text-lg">Current Mood</h3>
 <p className={`text-2xl font-bold mt-1 capitalize ${currentMoodObj ? currentMoodObj.textColor : 'text-text-primary'}`}>
 {data.mood.log ? data.mood.log.mood : 'Not logged'}
 </p>
 </>
 );
 })()}
 <p className="text-sm text-text-secondary mt-4 border-t border-border-color pt-3">
 How are you feeling today?
 </p>
 </motion.div>
 </Link>
 </div>
 </div>
 );
};

export default Dashboard;
