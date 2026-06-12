import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, HeartPulse } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
 const { user, loading } = useAuth();
 const location = useLocation();

  if (loading) {
  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <div className="flex items-center gap-3 text-sky-600 dark:text-sky-400 mb-6">
      <HeartPulse className="w-10 h-10" />
      <h1 className="text-3xl font-bold tracking-tight">Aurora</h1>
    </div>
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      <p className="text-sm font-medium text-text-secondary">Preparing your wellness dashboard...</p>
    </div>
  </div>
  );
  }

 if (!user) {
 return <Navigate to="/login" state={{ from: location }} replace />;
 }

 if (!user.onboardingCompleted && location.pathname !== '/onboard') {
 return <Navigate to="/onboard" replace />;
 }

 if (user.onboardingCompleted && location.pathname === '/onboard') {
 return <Navigate to="/dashboard" replace />;
 }

 return children;
};
