import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Hydration = React.lazy(() => import('./pages/Hydration'));
const Sleep = React.lazy(() => import('./pages/Sleep'));
const Mood = React.lazy(() => import('./pages/Mood'));
const AIChat = React.lazy(() => import('./pages/AIChat'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Settings = React.lazy(() => import('./pages/Settings'));

import { Loader2 } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoadingFallback = () => (
 <div className="min-h-screen flex items-center justify-center bg-background">
 <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
 </div>
);

function App() {
 const { user } = useAuth();

 return (
 <>
 <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
 <React.Suspense fallback={<LoadingFallback />}>
 <Routes>
 <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
 <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
 <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
 
 <Route path="/onboard" element={
 <ProtectedRoute>
 <Onboarding />
 </ProtectedRoute>
 } />

 <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
 <Route path="/dashboard" element={<Dashboard />} />
 <Route path="/hydration" element={<Hydration />} />
 <Route path="/sleep" element={<Sleep />} />
 <Route path="/mood" element={<Mood />} />
 <Route path="/ai-chat" element={<AIChat />} />
 <Route path="/analytics" element={<Analytics />} />
 <Route path="/settings" element={<Settings />} />
 </Route>
 
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 </React.Suspense>
 </>
 );
}

export default App;
