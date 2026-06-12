import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Moon, Smile, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { moodMap } from '../utils/moodConfig';
import { SkeletonCard, SkeletonInsight } from '../components/common/Skeletons';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const { cache, getDashboardData } = useData();
  const [loading, setLoading] = useState(!cache.dashboard);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (!cache.dashboard) {
      setLoading(true);
    }
    setError(null);
    try {
      await getDashboardData(isRefresh);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError("Unable to load health metrics. Please check your connection.");
      toast.error("Failed to refresh dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cache.dashboard, getDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const data = cache.dashboard || { hydration: null, sleep: null, mood: null };

  const hydrationPercent = data.hydration 
    ? Math.min((data.hydration.total / data.hydration.goal) * 100, 100) 
    : 0;

  const achievements = [];
  if (data.hydration && data.hydration.total > 0 && data.hydration.total >= data.hydration.goal) {
    achievements.push({ id: 1, title: 'Hydration Goal Completed', icon: '💧' });
  }
  if (data.sleep && data.sleep.log && data.sleep.log.duration >= data.sleep.goal) {
    achievements.push({ id: 2, title: 'Sleep Goal Completed', icon: '🌙' });
  }
  if (data.mood && data.mood.log) {
    const currentMoodObj = moodMap[data.mood.log.mood];
    achievements.push({ 
      id: 3, 
      title: `Current Mood: ${data.mood.log.mood}`, 
      icon: currentMoodObj ? currentMoodObj.emoji : '😊' 
    });
  }

  const displayName =
     user?.name ||
     (() => { try { return JSON.parse(localStorage.getItem('auroraUser'))?.name; } catch { return null; } })() ||
     'User';

  return (
    <div className="space-y-6">
      <header className="mb-8 flex justify-between items-start">
        <div>
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
        </div>
        
        {data.hydration && (
          <button 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-text-secondary rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </header>

      {/* Achievements bar */}
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

      {/* Main Error Alert Fallback */}
      {error && !data.hydration && (
        <div className="glass-card p-6 border-red-200 dark:border-red-800 bg-rose-50/10 text-center space-y-3">
          <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          <button 
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-sm transition-colors inline-block"
          >
            Retry Loading Dashboard
          </button>
        </div>
      )}

      {/* AI Insight Card */}
      {loading && !data.hydration ? (
        <SkeletonInsight />
      ) : error && !data.hydration ? (
        <div className="glass-card p-6 bg-slate-100 dark:bg-slate-900/10 flex items-center justify-center text-text-secondary min-h-[120px]">
          Unable to generate AI Insight.
        </div>
      ) : (
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
                {data.mood?.log?.mood
                  ? `You logged your mood as "${data.mood.log.mood}" today. ${
                      data.mood.log.mood === 'Stressed'
                        ? 'Try taking a few deep breaths, stretching, or going for a short walk to relieve tension.'
                        : data.mood.log.mood === 'Tired'
                        ? 'Ensure you get enough rest tonight. Winding down without screens earlier might help.'
                        : data.mood.log.mood === 'Sad'
                        ? 'Be gentle with yourself today. Connect with a loved one or take time for a relaxing activity.'
                        : data.mood.log.mood === 'Neutral'
                        ? 'A steady day so far. Keep monitoring how you feel and remember to hydrate.'
                        : 'It is wonderful that you are feeling happy! Keep sharing that positive energy.'
                    }`
                  : data.hydration && data.hydration.total < data.hydration.goal * 0.5 
                  ? "You are behind your hydration goal today. Drinking more water now will improve your energy levels later." 
                  : "You are doing great today! Keep up the consistency."}
              </p>
              <Link to="/ai-chat" className="inline-block mt-3 text-sm font-bold bg-card/20 hover:bg-card/30 px-4 py-1.5 rounded-full transition-colors">
                Chat with Aurora &rarr;
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Three Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Hydration Card */}
        {loading && !data.hydration ? (
          <SkeletonCard />
        ) : error && !data.hydration ? (
          <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center space-y-2 min-h-[170px]">
            <p className="text-sm text-text-secondary">Failed to load hydration details.</p>
          </div>
        ) : (
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
              <p className="text-2xl font-bold mt-1">
                {data.hydration?.total || 0} <span className="text-sm font-normal text-text-secondary">/ {data.hydration?.goal || 2000} ml</span>
              </p>
              <div className="w-full bg-surface rounded-full h-2 mt-4 overflow-hidden">
                <div className="bg-sky-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${hydrationPercent}%` }}></div>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Sleep Card */}
        {loading && !data.sleep ? (
          <SkeletonCard />
        ) : error && !data.sleep ? (
          <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center space-y-2 min-h-[170px]">
            <p className="text-sm text-text-secondary">Failed to load sleep details.</p>
          </div>
        ) : (
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
                  {data.sleep?.log?.quality || 'No Data'}
                </span>
              </div>
              <h3 className="font-bold text-lg">Sleep</h3>
              <p className="text-2xl font-bold mt-1">
                {data.sleep?.log ? data.sleep.log.duration.toFixed(1) : '0'} <span className="text-sm font-normal text-text-secondary">/ {data.sleep?.goal || 8} hrs</span>
              </p>
              <p className="text-sm text-text-secondary mt-4 border-t border-border-color pt-3">
                Last night's sleep
              </p>
            </motion.div>
          </Link>
        )}

        {/* Mood Card */}
        {loading && !data.mood ? (
          <SkeletonCard />
        ) : error && !data.mood ? (
          <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center space-y-2 min-h-[170px]">
            <p className="text-sm text-text-secondary">Failed to load mood details.</p>
          </div>
        ) : (
          <Link to="/mood">
            <motion.div 
              className="glass-card p-6 hover:-translate-y-1 transition-transform cursor-pointer h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {(() => {
                const currentMoodObj = data.mood?.log ? moodMap[data.mood.log.mood] : null;
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl flex items-center justify-center w-12 h-12 ${currentMoodObj ? currentMoodObj.textColor + ' bg-surface' : 'bg-surface text-text-secondary'}`}>
                        {currentMoodObj ? <span className="text-2xl leading-none">{currentMoodObj.emoji}</span> : <Smile className="w-6 h-6" />}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">Current Mood</h3>
                    <p className={`text-2xl font-bold mt-1 capitalize ${currentMoodObj ? currentMoodObj.textColor : 'text-text-primary'}`}>
                      {data.mood?.log ? data.mood.log.mood : 'Not logged'}
                    </p>
                  </>
                );
              })()}
              <p className="text-sm text-text-secondary mt-4 border-t border-border-color pt-3">
                How are you feeling today?
              </p>
            </motion.div>
          </Link>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
