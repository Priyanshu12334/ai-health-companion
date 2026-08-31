import React, { useState, useEffect, useCallback } from 'react';
import { Smile, Trash2, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { useData } from '../context/DataContext';
import { toast } from 'react-toastify';
import { SkeletonLogList } from '../components/common/Skeletons';

import { MOODS, moodMap } from '../utils/moodConfig';

const Mood = () => {
  const { cache, getMoodData, setCache } = useData();
  const [loading, setLoading] = useState(!cache.mood);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!cache.mood && !isRefresh) {
      setLoading(true);
    }
    try {
      await getMoodData(isRefresh);
    } catch (error) {
      toast.error('Failed to load mood data');
    } finally {
      setLoading(false);
    }
  }, [cache.mood, getMoodData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const data = cache.mood || { log: null, history: [] };
  const history = data.history || [];

  let moodScore = 0;
  if (data.log && data.log.mood) {
    const currentMood = data.log.mood;
    if (currentMood === 'Happy') moodScore = 30;
    else if (currentMood === 'Calm') moodScore = 25;
    else if (currentMood === 'Neutral') moodScore = 20;
    else if (currentMood === 'Tired') moodScore = 15;
    else if (currentMood === 'Sad') moodScore = 10;
    else if (currentMood === 'Stressed') moodScore = 5;
  }

  const saveMood = async (moodName) => {
    setSaving(true);
    try {
      await api.post('/mood', { mood: moodName });
      await getMoodData(true);
      toast.success('Mood saved successfully');
    } catch (error) {
      toast.error('Failed to save mood');
    } finally {
      setSaving(false);
    }
  };

  const deleteMood = async (id) => {
    if (!window.confirm("Delete this mood entry?")) return;
    try {
      await api.delete(`/mood/${id}`);
      await getMoodData(true);
      toast.success('Mood entry deleted');
    } catch (error) {
      toast.error('Failed to delete mood');
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Clear all mood history? This cannot be undone.")) return;
    try {
      await api.delete('/mood/clear');
      await getMoodData(true);
      toast.success('History cleared successfully');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const resetToday = async () => {
    if (!window.confirm("Reset today's mood progress?")) return;
    setLoading(true);
    try {
      await api.delete('/mood/today');
      toast.success("Today's mood reset successfully");
      const freshData = await getMoodData(true);
      if (cache.dashboard) {
        setCache(prev => ({
          ...prev,
          dashboard: {
            ...prev.dashboard,
            mood: freshData
          }
        }));
      }
    } catch (error) {
      toast.error('Failed to reset mood');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Smile className="text-orange-500"/> Mood Tracking
        </h2>
        <button 
          onClick={resetToday} 
          disabled={loading}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset Today
        </button>
      </div>
      
      {loading ? (
        <div className="animate-pulse glass-card p-8 text-center space-y-6">
          <div className="w-48 h-5 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto"></div>
          <div className="flex flex-wrap justify-center gap-4">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <h3 className="text-lg font-medium text-text-secondary mb-2">How are you feeling today?</h3>
          <h2 className="text-sm font-medium text-text-secondary mb-8">Choose the option that best describes how you feel right now.</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {MOODS.map((mood) => {
              const isCurrent = data.log?.mood === mood.name;
              return (
                <button
                  key={mood.name}
                  onClick={() => saveMood(mood.name)}
                  disabled={saving || loading}
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl transition-all duration-200 cursor-pointer transform hover:scale-[1.03] ${
                    isCurrent 
                      ? 'scale-[1.03] bg-sky-600 text-white font-bold shadow-md border border-transparent'
                      : 'bg-surface text-text-sky border border-border-color hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-xs'
                  } ${saving || loading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
                >
                  <img src={mood.iconUrl} alt={mood.name} className="w-10 h-10 object-contain drop-shadow-xs transition-transform duration-200" />
                  <span className={`mt-2 text-xs sm:text-sm font-semibold text-center ${isCurrent ? 'text-white' : ''}`}>{mood.name}</span>
                </button>
              );
            })}
          </div>
          {data.log && (
            <p className="mt-6 text-sm text-text-secondary">
              Last logged today at {new Date(data.log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-border-color flex justify-center items-center gap-2 text-sm text-text-secondary">
            <span className="font-medium">Health Score Contribution</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 bg-surface px-3 py-1 rounded-full border border-border-color">
              {moodScore} / 30
            </span>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Recent History</h3>
          {history.length > 0 && !loading && (
            <button onClick={clearHistory} className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-500 transition-colors cursor-pointer">
              <RotateCcw className="w-4 h-4" /> Clear History
            </button>
          )}
        </div>
        
        {loading ? (
          <SkeletonLogList />
        ) : (
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-text-secondary text-center py-4 bg-background /50 rounded-xl">No mood history found.</p>
            ) : (
              history.slice().reverse().map((log) => {
                const moodConfig = moodMap[log.mood] || moodMap.Neutral;
                return (
                  <div key={log._id} className="flex justify-between items-center p-4 bg-card rounded-xl shadow-sm border border-border-color transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <img src={moodConfig.iconUrl} alt={log.mood} className="w-7 h-7 object-contain shrink-0" />
                      <span className="font-semibold text-text-sky">{log.mood}</span>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-text-secondary">
                          {new Date(log.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button onClick={() => deleteMood(log._id)} className="p-2 text-text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mood;
