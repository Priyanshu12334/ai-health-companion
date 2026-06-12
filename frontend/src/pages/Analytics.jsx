import React, { useState, useEffect } from 'react';
import { BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { SkeletonChart } from '../components/common/Skeletons';

const Analytics = () => {
  const [hydrationData, setHydrationData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hydroRes, sleepRes] = await Promise.all([
        api.get('/hydration/weekly'),
        api.get('/sleep/weekly')
      ]);
      
      // Format Hydration Data
      const hData = hydroRes.data.map(item => ({
        date: item._id.substring(5), // MM-DD
        amount: item.total
      }));
      setHydrationData(hData);

      // Format Sleep Data
      const sData = sleepRes.data.map(item => ({
        date: new Date(item.date).toISOString().substring(5, 10),
        duration: parseFloat(item.duration.toFixed(1))
      }));
      setSleepData(sData);
      
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics data.');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="text-sky-600"/> Progress Analytics
      </h2>
      
      {error && !hydrationData.length && (
        <div className="glass-card p-6 border-red-200 dark:border-red-800 bg-rose-50/10 text-center space-y-3">
          <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          <button 
            onClick={fetchAnalytics}
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
                    <AreaChart data={hydrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
                    <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
