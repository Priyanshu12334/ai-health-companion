import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [cache, setCache] = useState({
    dashboard: null,
    hydration: null,
    sleep: null,
    mood: null,
    analytics: null,
    medicalReports: null,
  });

  const updateCache = useCallback((key, value) => {
    setCache((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearCache = useCallback(() => {
    setCache({
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
  }, [cache.dashboard]);

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
