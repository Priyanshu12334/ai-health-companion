import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Lock, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const { signup } = useAuth();
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 await signup(name, email, password);
 toast.success('Account created successfully!');
 navigate('/onboard');
 } catch (error) {
 toast.error(error.response?.data?.message || 'Signup failed');
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
 <div className="inline-flex items-center justify-center p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-4xl mb-4">
 <HeartPulse className="w-8 h-8" />
 </div>
 <h2 className="text-3xl font-bold mb-2">Create Account</h2>
 <p className="text-text-secondary">Join Aurora and start tracking</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
 <User className="w-5 h-5" />
 </div>
 <input
 type="text"
 required
 className="input-field pl-11"
 placeholder="Full Name"
 value={name}
 onChange={(e) => setName(e.target.value)}
 />
 </div>
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
 {loading ? 'Creating account...' : 'Sign Up'}
 </button>
 </form>

 <p className="mt-6 text-center text-text-secondary">
 Already have an account?{' '}
 <Link to="/login" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
 Log in
 </Link>
 </p>
 </motion.div>
 </div>
 );
};

export default Signup;
