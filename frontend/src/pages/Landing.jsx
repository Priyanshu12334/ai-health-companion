import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
 return (
 <div className="min-h-screen bg-background text-text-sky flex flex-col">
 <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
 <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
 <HeartPulse className="w-8 h-8" />
 <span className="text-2xl font-bold">Aurora</span>
 </div>
 <div className="gap-4 flex">
 <Link to="/login" className="px-6 py-2 rounded-xl text-text-secondary hover:bg-surface transition-colors font-medium">Log In</Link>
 <Link to="/signup" className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/30 transition-all font-medium transform hover:-translate-y-0.5">Sign Up</Link>
 </div>
 </header>

 <main className="flex-1 flex flex-col justify-center items-center p-6 text-center max-w-4xl mx-auto w-full">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
 Understand Yourself <br/>
 <span className="text-transparent bg-clip-text from-sky-500 to-sky-600">better every day.</span>
 </h1>
 <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
 Aurora is your AI-powered health companion. Track hydration, sleep, and mood effortlessly and get personalized insights to live a healthier life.
 </p>
 <div className="flex flex-col sm:flex-row justify-center gap-4">
 <Link to="/signup" className="btn-sky text-lg sm:w-auto px-10">Get Started for Free</Link>
 </div>
 </motion.div>

 <motion.div 
 className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.2 }}
 >
 <div className="glass-card p-6 flex flex-col items-center text-center">
 <div className="w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4 text-sky-600 dark:text-sky-400">
 <Activity className="w-7 h-7" />
 </div>
 <h3 className="text-xl font-bold mb-2">Smart Tracking</h3>
 <p className="text-text-secondary">Effortlessly log your daily habits and see your progress over time.</p>
 </div>
 <div className="glass-card p-6 flex flex-col items-center text-center border-sky-500/30 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-2 bg-sky-500 text-white rounded-bl-xl text-xs font-bold">NEW</div>
 <div className="w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4 text-sky-600 dark:text-sky-400">
 <HeartPulse className="w-7 h-7" />
 </div>
 <h3 className="text-xl font-bold mb-2">AI Insights</h3>
 <p className="text-text-secondary">Chat with Aurora to get personalized recommendations based on your unique data.</p>
 </div>
 <div className="glass-card p-6 flex flex-col items-center text-center">
 <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
 <ShieldCheck className="w-7 h-7" />
 </div>
 <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
 <p className="text-text-secondary">Your health data is securely stored and completely private to you.</p>
 </div>
 </motion.div>
 </main>
 </div>
 );
};

export default Landing;
