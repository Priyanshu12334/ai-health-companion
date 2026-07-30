import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Clock, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { useData } from '../context/DataContext';
import { toast } from 'react-toastify';
import { SkeletonGoalBanner } from '../components/common/Skeletons';

const Sleep = () => {
  const { cache, getSleepData, setCache } = useData();
  const [loading, setLoading] = useState(!cache.sleep);
  
  const [formData, setFormData] = useState({
    hours: '',
    quality: 'Good'
  });
  const [adding, setAdding] = useState(false);

  const fetchSleep = useCallback(async (isRefresh = false) => {
    if (!cache.sleep && !isRefresh) {
      setLoading(true);
    }
    try {
      await getSleepData(isRefresh);
    } catch (error) {
      toast.error('Failed to load sleep data');
    } finally {
      setLoading(false);
    }
  }, [cache.sleep, getSleepData]);

  useEffect(() => {
    fetchSleep();
  }, [fetchSleep]);

  const data = cache.sleep || { log: null, goal: 8 };

  const handleAddSleep = async (e) => {
    e.preventDefault();
    const parsedHours = parseFloat(formData.hours);

    if (isNaN(parsedHours) || parsedHours <= 0) {
      toast.error('Please enter valid sleep hours.');
      return;
    }
    if (parsedHours > 24) {
      toast.error('Sleep duration cannot exceed 24 hours.');
      return;
    }

    setAdding(true);
    
    try {
      const wakeDate = new Date();
      const bedDate = new Date(wakeDate.getTime() - parsedHours * 60 * 60 * 1000);

      await api.post('/sleep', {
        bedtime: bedDate.toISOString(),
        wakeupTime: wakeDate.toISOString(),
        quality: formData.quality
      });
      
      if (parsedHours >= data.goal) {
        toast.success('😴 Sleep Goal Achieved');
      } else {
        toast.success('Sleep logged successfully');
      }
      
      const freshData = await getSleepData(true);
      if (cache.dashboard) {
        setCache(prev => ({
          ...prev,
          dashboard: {
            ...prev.dashboard,
            sleep: freshData
          }
        }));
      }
      setFormData({ hours: '', quality: 'Good' });
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
      const freshData = await getSleepData(true);
      if (cache.dashboard) {
        setCache(prev => ({
          ...prev,
          dashboard: {
            ...prev.dashboard,
            sleep: freshData
          }
        }));
      }
    } catch (error) {
      toast.error('Failed to reset sleep log');
    } finally {
      setLoading(false);
    }
  };

  let sleepScore = 0;
  if (data.log && data.log.duration !== undefined && data.log.duration !== null) {
    const sleepDuration = data.log.duration;
    if (sleepDuration >= 8) sleepScore = 40;
    else if (sleepDuration >= 7) sleepScore = 35;
    else if (sleepDuration >= 6) sleepScore = 25;
    else if (sleepDuration >= 5) sleepScore = 15;
    else sleepScore = 5;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Moon className="text-sky-600"/> Sleep Tracking
        </h2>
        <button 
          onClick={resetToday} 
          disabled={loading}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" /> Reset Today's Sleep
        </button>
      </div>
      
      {loading ? (
        <SkeletonGoalBanner />
      ) : (
        <div className="glass-card p-6 bg-sky-600 text-white space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sky-200 text-sm mb-1">Total Sleep</p>
              <h1 className="text-4xl font-bold">
                {data.log ? `${data.log.duration} Hours` : '0 Hours'}
              </h1>
            </div>
            <div className="sm:text-right">
              <p className="text-sky-200 text-sm mb-1">Goal: {data.goal} hrs</p>
              <div className="px-3 py-1 bg-card/20 rounded-full text-sm font-medium inline-block">
                Quality: {data.log ? data.log.quality : '-'}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-sky-500/30 flex justify-between items-center">
            <span className="text-sm text-sky-200 font-medium">Health Score Contribution</span>
            <span className="text-lg font-bold text-white bg-white/20 px-3 py-0.5 rounded-lg">{sleepScore} / 40</span>
          </div>
        </div>
      )}

      <div className="glass-card p-6 mt-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-600" /> Log Sleep
        </h3>
        <form onSubmit={handleAddSleep} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Sleep Hours</label>
            <input 
              type="number" 
              step="0.1"
              min="0.1"
              max="24"
              placeholder="e.g. 7.5"
              required
              disabled={loading}
              className="input-field disabled:opacity-50" 
              value={formData.hours}
              onChange={(e) => setFormData({...formData, hours: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Sleep Quality</label>
            <select 
              className="input-field disabled:opacity-50"
              value={formData.quality}
              disabled={loading}
              onChange={(e) => setFormData({...formData, quality: e.target.value})}
            >
              <option value="Poor">Poor</option>
              <option value="Fair">Fair</option>
              <option value="Good">Good</option>
              <option value="Excellent">Excellent</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={adding || loading} 
            className="btn-sky bg-sky-600 hover:bg-sky-500 shadow-sky-500/30 disabled:opacity-50 disabled:transform-none"
          >
            {adding ? 'Saving...' : 'Save Sleep Log'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sleep;
