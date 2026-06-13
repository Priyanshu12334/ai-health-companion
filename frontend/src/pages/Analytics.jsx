import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { useData } from '../context/DataContext';
import { toast } from 'react-toastify';
import { SkeletonChart } from '../components/common/Skeletons';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 dark:bg-slate-900/95 backdrop-blur-md border border-border-color shadow-lg p-3 rounded-xl text-xs font-semibold text-text-sky">
        <p className="text-text-secondary mb-0.5">{label}</p>
        <p className="text-sky-600 dark:text-sky-400 font-bold text-sm">
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { cache, getAnalyticsData } = useData();
  const [loading, setLoading] = useState(!cache.analytics);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (!cache.analytics && !isRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      await getAnalyticsData(isRefresh);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics data.');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [cache.analytics, getAnalyticsData]);

  useEffect(() => {
    document.title = "Health Analytics";
    fetchAnalytics();
  }, [fetchAnalytics]);

  const data = cache.analytics || { hydrationWeekly: [], sleepWeekly: [] };

  // Helper to format date object to local YYYY-MM-DD
  const getLocalYYYYMMDD = (dateObj) => {
    const d = new Date(dateObj);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateVal = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${dateVal}`;
  };

  // Generate last 7 calendar days in chronological order
  const last7Days = (() => {
    const days = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = getLocalYYYYMMDD(d);
      const dayName = weekdayNames[d.getDay()];
      const dateStr = `${String(d.getDate()).padStart(2, '0')} ${monthNames[d.getMonth()]}`;
      days.push({ dateKey, dayName, dateStr });
    }
    return days;
  })();

  // Format Hydration Data (grouped by date to prevent duplicates)
  const hydrationData = last7Days.map(day => {
    const match = (data.hydrationWeekly || []).find(item => item._id === day.dateKey);
    return {
      date: day.dayName,
      fullDate: day.dateStr,
      amount: match ? match.total : 0
    };
  });

  // Format Sleep Data (grouped by date to prevent duplicates and sum duration)
  const sleepData = last7Days.map(day => {
    const matches = (data.sleepWeekly || []).filter(item => getLocalYYYYMMDD(item.date) === day.dateKey);
    const totalDuration = matches.reduce((sum, item) => sum + item.duration, 0);
    return {
      date: day.dayName,
      fullDate: day.dateStr,
      duration: parseFloat(totalDuration.toFixed(1))
    };
  });

  // Dynamic Ticks
  const maxHydration = Math.max(...hydrationData.map(d => d.amount), 2500);
  const hydrationTicks = [0, 500, 1000, 1500, 2000, 2500];
  if (maxHydration > 2500) {
    const extraTick = Math.ceil(maxHydration / 500) * 500;
    if (!hydrationTicks.includes(extraTick)) hydrationTicks.push(extraTick);
  }

  const maxSleep = Math.max(...sleepData.map(d => d.duration), 10);
  const sleepTicks = [0, 2, 4, 6, 8, 10];
  if (maxSleep > 10) {
    const extraTick = Math.ceil(maxSleep / 2) * 2;
    if (!sleepTicks.includes(extraTick)) sleepTicks.push(extraTick);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="text-sky-600"/> Health Analytics
      </h2>
      
      {error && !hydrationData.length && (
        <div className="glass-card p-6 border-red-200 dark:border-red-800 bg-rose-50/10 text-center space-y-3">
          <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          <button 
            onClick={() => fetchAnalytics(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-sm transition-colors inline-block"
          >
            Retry Loading Analytics
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            {/* Weekly Hydration Chart */}
            <div className="glass-card p-6 border-sky-500/20">
              <h3 className="font-bold text-lg mb-4 text-sky-600 dark:text-sky-600 flex items-center gap-2">
                <Activity className="w-5 h-5"/> Weekly Hydration
              </h3>
              <div className="h-64 w-full">
                {hydrationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hydrationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        ticks={hydrationTicks}
                        domain={[0, 'auto']}
                        tickFormatter={(value) => `${value} ml`}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        width={65}
                      />
                      <Tooltip 
                        content={<CustomTooltip unit="ml" />}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-text-secondary">
                    Not enough data to display
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Sleep Chart */}
            <div className="glass-card p-6 border-sky-500/20">
              <h3 className="font-bold text-lg mb-4 text-sky-600 dark:text-sky-600 flex items-center gap-2">
                <Activity className="w-5 h-5"/> Weekly Sleep
              </h3>
              <div className="h-64 w-full">
                {sleepData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        ticks={sleepTicks}
                        domain={[0, 'auto']}
                        tickFormatter={(value) => `${value} hrs`}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        width={55}
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        content={<CustomTooltip unit="hrs" />}
                      />
                      <Bar dataKey="duration" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-text-secondary">
                    Not enough data to display
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
