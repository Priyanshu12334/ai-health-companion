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
     toast.success('Registration successful. Please login.');
     navigate('/login');
   } catch (error) {
     const msg = error.response?.data?.message || '';
     if (
       error.response?.status === 409 || 
       error.response?.status === 400 || 
       msg.toLowerCase().includes('already exists')
     ) {
       toast.error('User already exists. Please login instead.');
     } else {
       toast.error(msg || 'Signup failed');
     }
   } finally {
     setLoading(false);
   }
 };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100/40 to-blue-50/60 p-4 relative overflow-hidden">
      {/* Subtle blue wellness-inspired glows & abstract pattern for depth */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 -right-20 w-[30rem] h-[30rem] bg-blue-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-sky-300/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none -z-10" />

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
 <h2 className="text-3xl font-bold mb-2">Create Account</h2>
 <p className="text-text-secondary">Join Wellora and start your journey</p>
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
