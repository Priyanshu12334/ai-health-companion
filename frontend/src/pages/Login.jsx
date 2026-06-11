import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const { login } = useAuth();
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 await login(email, password);
 toast.success('Welcome back!');
 navigate('/dashboard');
 } catch (error) {
 toast.error(error.response?.data?.message || 'Login failed');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-background p-4">
 <motion.div 
 className="max-w-md w-full glass-card p-8"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.4 }}
 >
 <div className="text-center mb-8">
 <div className="flex items-center justify-center gap-2 text-sky-600 dark:text-sky-400 mb-4">
 <HeartPulse className="w-8 h-8" />
 </div>
 <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
 <p className="text-text-secondary">Log in to continue your journey</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
 <Mail className="w-5 h-5" />
 </div>
 <input
 type="email"
 required
 className="input-field pl-11"
 placeholder="Email address"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </div>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
 <Lock className="w-5 h-5" />
 </div>
 <input
 type="password"
 required
 className="input-field pl-11"
 placeholder="Password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 />
 </div>
 <button type="submit" className="btn-sky" disabled={loading}>
 {loading ? 'Logging in...' : 'Log In'}
 </button>
 </form>

 <p className="mt-6 text-center text-text-secondary">
 Don't have an account?{' '}
 <Link to="/signup" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
 Sign up
 </Link>
 </p>
 </motion.div>
 </div>
 );
};

export default Login;
