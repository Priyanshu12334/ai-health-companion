import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import LoadingScreen from './common/LoadingScreen';

export const ProtectedRoute = ({ children }) => {
 const { user, loading } = useAuth();
 const location = useLocation();

 if (loading) {
  return <LoadingScreen />;
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
