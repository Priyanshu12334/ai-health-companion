import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Hydration from './pages/Hydration';
import Sleep from './pages/Sleep';
import Mood from './pages/Mood';
import AIChat from './pages/AIChat';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import MedicalReports from './pages/MedicalReports';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
 const { user } = useAuth();

 return (
 <>
 <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
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
 <Route path="/medical-reports" element={<MedicalReports />} />
 <Route path="/settings" element={<Settings />} />
 </Route>
 
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 </>
 );
}

export default App;
