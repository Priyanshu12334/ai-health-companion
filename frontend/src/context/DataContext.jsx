import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const calculateHealthScore = (dashboardData) => {
  if (!dashboardData) return 0;
  
  // Sleep duration
  const sleepDuration = dashboardData.sleep?.log?.duration;
  let sleepScore = 0;
  if (sleepDuration !== undefined && sleepDuration !== null) {
    if (sleepDuration >= 8) sleepScore = 40;
    else if (sleepDuration >= 7) sleepScore = 35;
    else if (sleepDuration >= 6) sleepScore = 25;
    else if (sleepDuration >= 5) sleepScore = 15;
    else sleepScore = 5;
  }

  // Hydration
  const hydrationLogs = dashboardData.hydration?.logs || [];
  let hydrationScore = 0;
  if (hydrationLogs.length > 0) {
    const hydrationTotal = dashboardData.hydration.total;
    if (hydrationTotal !== undefined && hydrationTotal !== null && hydrationTotal > 0) {
      if (hydrationTotal >= 2500) hydrationScore = 30;
      else if (hydrationTotal >= 2000) hydrationScore = 25;
      else if (hydrationTotal >= 1500) hydrationScore = 15;
      else if (hydrationTotal >= 1000) hydrationScore = 10;
      else hydrationScore = 5;
    }
  }

  // Mood
  const currentMood = dashboardData.mood?.log?.mood;
  let moodScore = 0;
  if (currentMood) {
    if (currentMood === 'Happy') moodScore = 30;
    else if (currentMood === 'Calm') moodScore = 25;
    else if (currentMood === 'Neutral') moodScore = 20;
    else if (currentMood === 'Tired') moodScore = 15;
    else if (currentMood === 'Sad') moodScore = 10;
    else if (currentMood === 'Stressed') moodScore = 5;
  }

  return sleepScore + hydrationScore + moodScore;
};

export const DataProvider = ({ children }) => {
  const [cache, setCacheState] = useState({
    dashboard: null,
    hydration: null,
    sleep: null,
    mood: null,
    analytics: null,
    medicalReports: null,
  });

  const setCache = useCallback((updater) => {
    setCacheState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next.dashboard) {
        const score = calculateHealthScore(next.dashboard);
        localStorage.setItem('dashboardHealthScore', score);
      } else {
        localStorage.setItem('dashboardHealthScore', 0);
      }
      return next;
    });
  }, []);

  const updateCache = useCallback((key, value) => {
    setCache((prev) => ({ ...prev, [key]: value }));
  }, [setCache]);

  const clearCache = useCallback(() => {
    localStorage.removeItem('dashboardHealthScore');
    setCacheState({
      dashboard: null,
      hydration: null,
      sleep: null,
      mood: null,
      analytics: null,
      medicalReports: null,
    });
  }, []);

  const getDashboardData = useCallback(async (isRefresh = false) => {
    if (cache.dashboard && !isRefresh) {
      return cache.dashboard;
    }
    const [hydroRes, sleepRes, moodRes] = await Promise.all([
      api.get('/hydration'),
      api.get('/sleep'),
      api.get('/mood')
    ]);
    const newData = {
      hydration: hydroRes.data,
      sleep: sleepRes.data,
      mood: moodRes.data
    };
    setCache((prev) => ({ ...prev, dashboard: newData }));
    return newData;
  }, [cache.dashboard, setCache]);

  const getHydrationData = useCallback(async (isRefresh = false) => {
    if (cache.hydration && !isRefresh) {
      return cache.hydration;
    }
    const res = await api.get('/hydration');
    setCache((prev) => ({ ...prev, hydration: res.data }));
    return res.data;
  }, [cache.hydration]);

  const getSleepData = useCallback(async (isRefresh = false) => {
    if (cache.sleep && !isRefresh) {
      return cache.sleep;
    }
    const res = await api.get('/sleep');
    setCache((prev) => ({ ...prev, sleep: res.data }));
    return res.data;
  }, [cache.sleep]);

  const getMoodData = useCallback(async (isRefresh = false) => {
    if (cache.mood && !isRefresh) {
      return cache.mood;
    }
    const [todayRes, historyRes] = await Promise.all([
      api.get('/mood'),
      api.get('/mood/history')
    ]);
    const newData = {
      log: todayRes.data.log,
      history: historyRes.data
    };
    setCache((prev) => {
      const nextCache = { ...prev, mood: newData };
      if (prev.dashboard) {
        nextCache.dashboard = {
          ...prev.dashboard,
          mood: todayRes.data
        };
      }
      return nextCache;
    });
    return newData;
  }, [cache.mood]);

  const getAnalyticsData = useCallback(async (isRefresh = false) => {
    if (cache.analytics && !isRefresh) {
      return cache.analytics;
    }
    const [hydroRes, sleepRes] = await Promise.all([
      api.get('/hydration/weekly'),
      api.get('/sleep/weekly')
    ]);
    const newData = {
      hydrationWeekly: hydroRes.data,
      sleepWeekly: sleepRes.data
    };
    setCache((prev) => ({ ...prev, analytics: newData }));
    return newData;
  }, [cache.analytics]);

  const getMedicalReports = useCallback(async (isRefresh = false) => {
    if (cache.medicalReports && !isRefresh) {
      return cache.medicalReports;
    }
    const res = await api.get('/medical-reports');
    setCache((prev) => ({ ...prev, medicalReports: res.data }));
    return res.data;
  }, [cache.medicalReports]);

  return (
    <DataContext.Provider value={{
      cache,
      setCache,
      updateCache,
      clearCache,
      getDashboardData,
      getHydrationData,
      getSleepData,
      getMoodData,
      getAnalyticsData,
      getMedicalReports
    }}>
      {children}
    </DataContext.Provider>
  );
};
