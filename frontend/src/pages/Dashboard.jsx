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

  // Health Score calculations
  const sleepDuration = data.sleep?.log?.duration;
  let sleepScore = 25; // Default if missing
  if (sleepDuration !== undefined && sleepDuration !== null) {
    if (sleepDuration >= 8) sleepScore = 40;
    else if (sleepDuration >= 7) sleepScore = 35;
    else if (sleepDuration >= 6) sleepScore = 25;
    else if (sleepDuration >= 5) sleepScore = 15;
    else sleepScore = 5;
  }

  const hydrationTotal = data.hydration?.total;
  let hydrationScore = 15; // Default if missing
  if (hydrationTotal !== undefined && hydrationTotal !== null) {
    if (hydrationTotal >= 2500) hydrationScore = 30;
    else if (hydrationTotal >= 2000) hydrationScore = 25;
    else if (hydrationTotal >= 1500) hydrationScore = 15;
    else if (hydrationTotal >= 1000) hydrationScore = 10;
    else hydrationScore = 5;
  }

  const currentMood = data.mood?.log?.mood;
  let moodScore = 20; // Default if missing (Neutral)
  if (currentMood) {
    if (currentMood === 'Happy') moodScore = 30;
    else if (currentMood === 'Calm') moodScore = 25;
    else if (currentMood === 'Neutral') moodScore = 20;
    else if (currentMood === 'Tired') moodScore = 15;
    else if (currentMood === 'Sad') moodScore = 10;
    else if (currentMood === 'Stressed') moodScore = 5;
  }

  const healthScore = sleepScore + hydrationScore + moodScore;

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1000;
    const startValue = animatedScore;
    const endValue = healthScore;

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (endValue - startValue) + startValue);
      setAnimatedScore(currentValue);
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [healthScore]);

  let statusText = 'Fair';
  let statusEmoji = '🟡';
  let statusColor = 'text-yellow-600 dark:text-yellow-400';
  
  if (healthScore >= 90) {
    statusText = 'Excellent';
    statusEmoji = '🟢';
    statusColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (healthScore >= 75) {
    statusText = 'Good';
    statusEmoji = '🟢';
    statusColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (healthScore >= 60) {
    statusText = 'Fair';
    statusEmoji = '🟡';
    statusColor = 'text-yellow-600 dark:text-yellow-400';
  } else if (healthScore >= 40) {
    statusText = 'Needs Improvement';
    statusEmoji = '🟠';
    statusColor = 'text-orange-600 dark:text-orange-400';
  } else {
    statusText = 'Poor';
    statusEmoji = '🔴';
    statusColor = 'text-rose-600 dark:text-rose-400';
  }

  let healthInsight = "Great job maintaining healthy habits.";
  if (healthScore < 90) {
    const sleepRel = sleepScore / 40;
    const hydrationRel = hydrationScore / 30;
    const moodRel = moodScore / 30;
    
    if (sleepRel <= hydrationRel && sleepRel <= moodRel) {
      healthInsight = "Sleep is currently reducing your score.";
    } else if (hydrationRel <= sleepRel && hydrationRel <= moodRel) {
      healthInsight = "Increase hydration to improve your score.";
    } else {
      healthInsight = "Improve your mood to boost score.";
    }
  }

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

      {/* Health Score Card (Featured Card) */}
      {loading && !data.hydration ? (
        <SkeletonInsight />
      ) : error && !data.hydration ? (
        <div className="glass-card p-6 bg-slate-100 dark:bg-slate-900/10 flex items-center justify-center text-text-secondary min-h-[120px]">
          Unable to calculate Health Score.
        </div>
      ) : (
        <motion.div 
          className="glass-card p-6 bg-sky-600 from-sky-500 to-sky-600 text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Column: Overall Score & Insights */}
            <div className="space-y-3 text-center md:text-left">
              <div>
                <h3 className="text-white/85 uppercase tracking-wider text-xs font-semibold">Overall Health Score</h3>
                <div className="flex items-baseline justify-center md:justify-start gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-white">{animatedScore}</span>
                  <span className="text-white/60 text-sm">/ 100</span>
                  <span className="text-xl leading-none ml-1">{statusEmoji}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1 bg-white/20 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-white">
                  Status: {statusText}
                </span>
              </div>
              
              <p className="text-sm text-white/95 italic max-w-sm">
                "{healthInsight}"
              </p>
            </div>

            {/* Middle Column: Progress Ring */}
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    className="stroke-white/20 fill-none"
                    strokeWidth="6"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    className="stroke-white fill-none transition-all duration-1000 ease-out"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 - (animatedScore / 100) * (2 * Math.PI * 38)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white leading-none">{animatedScore}%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Score Breakdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-2.5 text-sm text-white/90">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white/70 border-b border-white/10 pb-1.5">Score Breakdown</h4>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">🌙 Sleep Duration</span>
                <span className="font-bold">{sleepScore} / 40</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">💧 Water Hydration</span>
                <span className="font-bold">{hydrationScore} / 30</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">😊 Daily Mood</span>
                <span className="font-bold">{moodScore} / 30</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Three Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
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
              transition={{ delay: 0.4 }}
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
              transition={{ delay: 0.5 }}
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
              transition={{ delay: 0.6 }}
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
