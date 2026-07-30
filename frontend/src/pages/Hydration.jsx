import React, { useState, useEffect, useCallback } from 'react';
import { Droplets, Plus, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { useData } from '../context/DataContext';
import { toast } from 'react-toastify';
import { SkeletonGoalBanner, SkeletonLogList } from '../components/common/Skeletons';

const Hydration = () => {
  const { cache, getHydrationData, setCache } = useData();
  const [loading, setLoading] = useState(!cache.hydration);
  const [adding, setAdding] = useState(false);

  const fetchHydration = useCallback(async (isRefresh = false) => {
    if (!cache.hydration && !isRefresh) {
      setLoading(true);
    }
    try {
      await getHydrationData(isRefresh);
    } catch (error) {
      toast.error('Failed to load hydration data');
    } finally {
      setLoading(false);
    }
  }, [cache.hydration, getHydrationData]);

  useEffect(() => {
    fetchHydration();
  }, [fetchHydration]);

  const data = cache.hydration || { logs: [], total: 0, goal: 2000 };

  const addWater = async (amount) => {
    setAdding(true);
    try {
      await api.post('/hydration', { amount });
      
      if (data.total < data.goal && data.total + amount >= data.goal) {
        toast.success('🎉 Daily Hydration Goal Completed!');
      } else {
        toast.success(`Added ${amount}ml of water`);
      }
      
      const freshData = await getHydrationData(true);
      if (cache.dashboard) {
        setCache(prev => ({
          ...prev,
          dashboard: {
            ...prev.dashboard,
            hydration: freshData
          }
        }));
      }
    } catch (error) {
      toast.error('Failed to add water');
    } finally {
      setAdding(false);
    }
  };

  const resetToday = async () => {
    if (!window.confirm("Reset today's hydration progress?")) return;
    setLoading(true);
    try {
      await api.delete('/hydration/today');
      toast.success("Today's hydration reset successfully");
      const freshData = await getHydrationData(true);
      if (cache.dashboard) {
        setCache(prev => ({
          ...prev,
          dashboard: {
            ...prev.dashboard,
            hydration: freshData
          }
        }));
      }
    } catch (error) {
      toast.error('Failed to reset hydration');
    } finally {
      setLoading(false);
    }
  };

  const goal = data.goal || 2000;
  const remainingWater = Math.max(0, goal - (data.total || 0));

  let hydrationScore = 0;
  if (data.logs && data.logs.length > 0 && data.total && data.total > 0) {
    if (data.total >= goal) hydrationScore = 30;
    else if (data.total >= goal * 0.75) hydrationScore = 25;
    else if (data.total >= goal * 0.5) hydrationScore = 15;
    else if (data.total >= goal * 0.25) hydrationScore = 10;
    else hydrationScore = 5;
  }

  const percent = Math.min((data.total / data.goal) * 100, 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="text-sky-600"/> Hydration Tracking
        </h2>
        <button 
          onClick={resetToday} 
          disabled={loading}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" /> Reset Today
        </button>
      </div>
     
      {loading ? (
        <SkeletonGoalBanner />
      ) : (
        <div className="glass-card p-8 text-center relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-sky-500/10 pointer-events-none" 
            style={{ height: `${percent}%`, top: 'auto', bottom: 0, transition: 'height 1s ease-in-out' }}
          ></div>
          <div className="relative z-10">
            <p className="text-sm text-text-secondary mb-2">Daily Goal: {data.goal}ml</p>
            <h1 className="text-6xl font-extrabold text-sky-600 dark:text-sky-600 mb-4">
              {data.total}<span className="text-2xl text-text-secondary font-medium ml-1">ml</span>
            </h1>
            
            <div className="w-full bg-surface rounded-full h-4 mt-6 overflow-hidden">
              <div className="bg-sky-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
            </div>
            <p className="mt-2 text-sm font-medium text-text-secondary">{Math.round(percent)}% completed</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border-color">
              <div className="bg-surface/60 p-3 rounded-xl">
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Remaining Water</p>
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">{remainingWater} ml</p>
              </div>
              <div className="bg-surface/60 p-3 rounded-xl">
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Health Score Contribution</p>
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">{hydrationScore} / 30</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-8">
        <button 
          onClick={() => addWater(250)} 
          disabled={adding || loading} 
          className="glass-card p-4 flex flex-col items-center hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors border-sky-200 dark:border-sky-800 disabled:opacity-50"
        >
          <Plus className="w-6 h-6 text-sky-500 mb-2" />
          <span className="font-bold">250ml</span>
          <span className="text-xs text-text-secondary">Glass</span>
        </button>
        <button 
          onClick={() => addWater(500)} 
          disabled={adding || loading} 
          className="glass-card p-4 flex flex-col items-center hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors border-sky-200 dark:border-sky-800 disabled:opacity-50"
        >
          <Plus className="w-6 h-6 text-sky-500 mb-2" />
          <span className="font-bold">500ml</span>
          <span className="text-xs text-text-secondary">Bottle</span>
        </button>
        <button 
          onClick={() => addWater(1000)} 
          disabled={adding || loading} 
          className="glass-card p-4 flex flex-col items-center hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors border-sky-200 dark:border-sky-800 disabled:opacity-50"
        >
          <Plus className="w-6 h-6 text-sky-500 mb-2" />
          <span className="font-bold">1L</span>
          <span className="text-xs text-text-secondary">Jug</span>
        </button>
      </div>

      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">Today's Logs</h3>
        {loading ? (
          <SkeletonLogList />
        ) : (
          <div className="space-y-3">
            {data.logs.length === 0 ? (
              <p className="text-text-secondary text-center py-4 bg-background /50 rounded-xl">No logs today yet.</p>
            ) : (
              data.logs.map((log) => (
                <div key={log._id} className="flex justify-between items-center p-4 bg-card rounded-xl shadow-sm border border-border-color">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 dark:bg-sky-900/30 text-sky-500 rounded-lg">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{log.amount} ml</span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hydration;
