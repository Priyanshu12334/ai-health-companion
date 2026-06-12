import React, { useState, useEffect } from 'react';
import { Moon, Clock, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import LoadingScreen from '../components/common/LoadingScreen';

const Sleep = () => {
 const [data, setData] = useState({ log: null, goal: 8 });
 const [loading, setLoading] = useState(true);
 
 const [formData, setFormData] = useState({
 bedtime: '',
 wakeupTime: '',
 quality: 'Good'
 });
 const [adding, setAdding] = useState(false);

 const fetchSleep = async () => {
 try {
 const res = await api.get('/sleep');
 setData(res.data);
 } catch (error) {
 toast.error('Failed to load sleep data');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchSleep();
 }, []);

 const handleAddSleep = async (e) => {
 e.preventDefault();
 setAdding(true);
 
 try {
 const today = new Date();
 
 const [bedHours, bedMins] = formData.bedtime.split(':');
 const bedDate = new Date(today);
 bedDate.setHours(parseInt(bedHours), parseInt(bedMins), 0);
 
 const [wakeHours, wakeMins] = formData.wakeupTime.split(':');
 const wakeDate = new Date(today);
 wakeDate.setHours(parseInt(wakeHours), parseInt(wakeMins), 0);

 // If wake time is less than bedtime, it means the sleep crossed midnight
 if (wakeDate < bedDate) {
   bedDate.setDate(bedDate.getDate() - 1);
 }

 const duration = (wakeDate - bedDate) / (1000 * 60 * 60);
 if (duration <= 0) {
   toast.error('Wake time must be after bedtime.');
   setAdding(false);
   return;
 }
 if (duration > 24) {
   toast.error('Sleep duration cannot exceed 24 hours.');
   setAdding(false);
   return;
 }

 await api.post('/sleep', {
 bedtime: bedDate.toISOString(),
 wakeupTime: wakeDate.toISOString(),
 quality: formData.quality
 });
 
 if (duration >= data.goal) {
   toast.success('😴 Sleep Goal Achieved');
 } else {
   toast.success('Sleep logged successfully');
 }
 
 fetchSleep();
 setFormData({ bedtime: '', wakeupTime: '', quality: 'Good' });
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to log sleep');
 } finally {
 setAdding(false);
 }
 };

 const resetToday = async () => {
   if (!window.confirm("Reset today's sleep log?")) return;
   setLoading(true);
   try {
     await api.delete('/sleep/today');
     toast.success("Today's sleep log reset successfully");
     fetchSleep();
   } catch (error) {
     toast.error('Failed to reset sleep log');
     setLoading(false);
   }
 };

 if (loading) return <LoadingScreen />;

 return (
 <div className="space-y-6 max-w-2xl mx-auto w-full">
 <div className="flex justify-between items-center">
   <h2 className="text-2xl font-bold flex items-center gap-2"><Moon className="text-sky-600"/> Sleep Tracking</h2>
   <button onClick={resetToday} className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-500 transition-colors">
     <RotateCcw className="w-4 h-4" /> Reset Today's Sleep
   </button>
 </div>
 
 <div className="glass-card p-6 bg-sky-600 text-white flex justify-between items-center">
 <div>
 <p className="text-sky-200 text-sm mb-1">Last Night's Sleep</p>
 <h1 className="text-4xl font-bold">
 {data.log ? data.log.duration.toFixed(1) : '0'} <span className="text-xl font-normal text-sky-300">hrs</span>
 </h1>
 </div>
 <div className="text-right">
 <p className="text-sky-200 text-sm mb-1">Goal: {data.goal} hrs</p>
 <div className="px-3 py-1 bg-card/20 rounded-full text-sm font-medium">
 Quality: {data.log ? data.log.quality : '-'}
 </div>
 </div>
 </div>

 <div className="glass-card p-6 mt-6">
 <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-sky-600" /> Log Sleep Manually</h3>
 <form onSubmit={handleAddSleep} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1 text-text-secondary">Bedtime</label>
 <input 
 type="time" 
 required
 className="input-field" 
 value={formData.bedtime}
 onChange={(e) => setFormData({...formData, bedtime: e.target.value})}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1 text-text-secondary">Wake up time</label>
 <input 
 type="time" 
 required
 className="input-field" 
 value={formData.wakeupTime}
 onChange={(e) => setFormData({...formData, wakeupTime: e.target.value})}
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1 text-text-secondary">Quality</label>
 <select 
 className="input-field"
 value={formData.quality}
 onChange={(e) => setFormData({...formData, quality: e.target.value})}
 >
 <option value="Poor">Poor</option>
 <option value="Fair">Fair</option>
 <option value="Good">Good</option>
 <option value="Excellent">Excellent</option>
 </select>
 </div>
 <button type="submit" disabled={adding} className="btn-sky bg-sky-600 hover:bg-sky-500 shadow-sky-500/30">
 {adding ? 'Saving...' : 'Save Sleep Log'}
 </button>
 </form>
 </div>
 </div>
 );
};

export default Sleep;
