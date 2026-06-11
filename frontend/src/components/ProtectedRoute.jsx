import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
 const { user, loading } = useAuth();
 const location = useLocation();

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-background">
 <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
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
