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
  const [isSurging, setIsSurging] = useState(false);
  const [activeRippleBtn, setActiveRippleBtn] = useState(null);

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

  // Smooth numeric count-up animation for displayed ml value and percentage
  const [animatedTotal, setAnimatedTotal] = useState(data.total || 0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 900;
    const startValue = animatedTotal;
    const endValue = data.total || 0;

    if (startValue === endValue) return;

    let animationFrameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Smooth cubic ease out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);
      setAnimatedTotal(currentValue);
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [data.total]);

  const addWater = async (amount) => {
    setAdding(true);
    setIsSurging(true);
    setActiveRippleBtn(amount);
    setTimeout(() => setIsSurging(false), 1400);
    setTimeout(() => setActiveRippleBtn(null), 600);

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

  const percent = Math.min((data.total / (goal || 2000)) * 100, 100);
  const displayPercent = Math.min(Math.round(((animatedTotal || 0) / (goal || 2000)) * 100), 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="text-sky-600"/> Hydration Tracking
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
        <SkeletonGoalBanner />
      ) : (
        <div className="glass-card p-8 text-center relative overflow-hidden">
          {/* Realistic Liquid Wave Fill Background */}
          <div 
            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-sky-500/25 via-sky-400/15 to-sky-300/10 pointer-events-none transition-[height] duration-1000 ease-[cubic-bezier(0.34,1.15,0.64,1)]" 
            style={{ height: `${percent}%` }}
          >
            {percent > 0 && (
              <div className={`absolute -top-3 left-0 w-full overflow-hidden pointer-events-none transition-opacity duration-300 ${isSurging ? 'opacity-90' : 'opacity-65'}`}>
                {/* Back Wave Layer */}
                <div className="absolute -top-0.5 left-0 w-[200%] h-4 animate-wave-back text-sky-400/30">
                  <svg viewBox="0 0 1000 20" className="w-full h-full fill-current" preserveAspectRatio="none">
                    <path d="M 0 8 Q 125 0 250 8 T 500 8 T 750 8 T 1000 8 V 20 H 0 Z" />
                  </svg>
                </div>
                {/* Front Wave Layer */}
                <div className="absolute top-0 left-0 w-[200%] h-4 animate-wave-front text-sky-500/35">
                  <svg viewBox="0 0 1000 20" className="w-full h-full fill-current" preserveAspectRatio="none">
                    <path d="M 0 10 Q 125 18 250 10 T 500 10 T 750 10 T 1000 10 V 20 H 0 Z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10">
            <p className="text-sm text-text-secondary mb-2">Daily Goal: {data.goal}ml</p>
            <h1 className="text-6xl font-extrabold text-sky-600 dark:text-sky-600 mb-4 transition-all duration-300">
              {animatedTotal}<span className="text-2xl text-text-secondary font-medium ml-1">ml</span>
            </h1>
            
            {/* Fluid Progress Bar */}
            <div className="w-full bg-surface rounded-full h-4 mt-6 overflow-hidden relative shadow-inner">
              <div 
                className="bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400 h-4 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.15,0.64,1)] relative overflow-hidden" 
                style={{ width: `${percent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60 animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-text-secondary">{displayPercent}% completed</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border-color">
              <div className="bg-surface/60 p-3 rounded-xl">
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Remaining Water</p>
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">{remainingWater} ml</p>
              </div>
              <div className="bg-surface/60 p-3 rounded-xl">
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Daily Wellness Score Contribution</p>
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
          className="glass-card p-4 flex flex-col items-center hover:bg-sky-100/70 dark:hover:bg-sky-900/20 active:scale-95 transition-all duration-200 border-sky-200/80 dark:border-sky-800 disabled:opacity-50 cursor-pointer group relative overflow-hidden"
        >
          {activeRippleBtn === 250 && (
            <span className="absolute inset-0 rounded-2xl bg-sky-400/20 animate-ping pointer-events-none" />
          )}
          <Plus className="w-6 h-6 text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-bold">250ml</span>
          <span className="text-xs text-text-secondary">Glass</span>
        </button>
        <button 
          onClick={() => addWater(500)} 
          disabled={adding || loading} 
          className="glass-card p-4 flex flex-col items-center hover:bg-sky-100/70 dark:hover:bg-sky-900/20 active:scale-95 transition-all duration-200 border-sky-200/80 dark:border-sky-800 disabled:opacity-50 cursor-pointer group relative overflow-hidden"
        >
          {activeRippleBtn === 500 && (
            <span className="absolute inset-0 rounded-2xl bg-sky-400/20 animate-ping pointer-events-none" />
          )}
          <Plus className="w-6 h-6 text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-bold">500ml</span>
          <span className="text-xs text-text-secondary">Bottle</span>
        </button>
        <button 
          onClick={() => addWater(1000)} 
          disabled={adding || loading} 
          className="glass-card p-4 flex flex-col items-center hover:bg-sky-100/70 dark:hover:bg-sky-900/20 active:scale-95 transition-all duration-200 border-sky-200/80 dark:border-sky-800 disabled:opacity-50 cursor-pointer group relative overflow-hidden"
        >
          {activeRippleBtn === 1000 && (
            <span className="absolute inset-0 rounded-2xl bg-sky-400/20 animate-ping pointer-events-none" />
          )}
          <Plus className="w-6 h-6 text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-bold">1L</span>
          <span className="text-xs text-text-secondary">Jug</span>
        </button>
      </div>

      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">Recent History</h3>
        {loading ? (
          <SkeletonLogList />
        ) : (
          <div className="space-y-3">
            {data.logs.length === 0 ? (
              <p className="text-text-secondary text-center py-4 bg-background /50 rounded-xl">No logs today yet.</p>
            ) : (
              data.logs.map((log) => (
                <div key={log._id} className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border-color">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-sky-500 shrink-0" />
                    <span className="font-medium text-text-sky">{log.amount} ml</span>
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
