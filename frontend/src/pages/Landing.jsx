import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, MessageCircle, Apple, BarChart3, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const BenefitBadge = ({ label }) => (
  <span className="flex items-center gap-2.5 h-[44px] px-5 bg-white border border-[#E2E8F0] rounded-full text-[#334155] text-sm sm:text-[15px] font-semibold shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 transition-all duration-200 ease whitespace-nowrap cursor-default">
    <Check className="w-[19px] h-[19px] text-[#0EA5E9] shrink-0" />
    <span>{label}</span>
  </span>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card p-6 flex flex-col items-start text-left hover:border-sky-500/50 transition-all duration-300 group hover:-translate-y-1">
    <div className="w-12 h-12 rounded-2xl bg-[#0EA5E9] text-white flex items-center justify-center mb-5 shadow-[0_6px_16px_rgba(14,165,233,0.20)] group-hover:shadow-[0_8px_20px_rgba(14,165,233,0.30)] group-hover:scale-105 transition-all duration-200 ease shrink-0">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold mb-2 text-text-sky">{title}</h3>
    <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-text-sky flex flex-col relative overflow-x-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/40 dark:bg-sky-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-950/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5 text-sky-600 dark:text-sky-400">
          <HeartPulse className="w-8 h-8 shrink-0 animate-pulse" />
          <span className="text-2xl font-bold tracking-tight">Wellora</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link 
            to="/login" 
            className="px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-xl text-text-secondary hover:text-text-sky hover:bg-surface transition-all font-medium"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20 transition-all font-medium transform hover:-translate-y-0.5"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 md:py-16 flex flex-col items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center flex flex-col items-center max-w-3xl mx-auto space-y-6 md:space-y-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-sky leading-[1.15] text-balance">
            Your Personal <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sky-400 dark:from-sky-400 dark:to-sky-500">
              AI Health Companion
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto px-2">
            Monitor hydration, sleep, mood, nutrition, and medical reports with personalized AI-powered health insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none justify-center items-stretch sm:items-center pt-2">
            <Link 
              to="/signup" 
              className="px-8 py-3.5 sm:py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 font-semibold text-center transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
            >
              Start Your Health Journey
            </Link>
            <a 
              href="#features" 
              className="px-8 py-3.5 sm:py-4 border border-border-color bg-card/60 backdrop-blur-sm hover:bg-card text-text-sky rounded-xl font-semibold text-center transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
            >
              Learn More
            </a>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 max-w-3xl mx-auto pt-6 sm:pt-8">
            <BenefitBadge label="Health Score Tracking" />
            <BenefitBadge label="Nutrition Insights" />
            <BenefitBadge label="AI Health Assistant" />
            <BenefitBadge label="Medical Report Analysis" />
            <BenefitBadge label="Personalized Recommendations" />
          </div>
        </motion.div>

        <div id="features" className="pt-24 pb-8 text-center w-full scroll-mt-6">
          <span className="inline-block text-xs sm:text-sm font-semibold tracking-wider text-white uppercase bg-[#0EA5E9] px-4 py-1.5 rounded-full border-0 shadow-[0_6px_16px_rgba(14,165,233,0.25)] hover:shadow-[0_8px_20px_rgba(14,165,233,0.35)] hover:-translate-y-0.5 transition-all duration-200 ease cursor-default">
            Core Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 text-text-sky">
            Everything you need to thrive
          </h2>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pb-16"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FeatureCard 
            icon={<MessageCircle className="w-6 h-6" />}
            title="AI Health Assistant"
            description="Chat with Wellora to get personalized recommendations based on your unique data."
          />
          <FeatureCard 
            icon={<Apple className="w-6 h-6" />}
            title="Nutrition Coach"
            description="Search food items and get instant nutrition info and meal suggestions."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6" />}
            title="Health Analytics"
            description="Visualize your sleep, hydration, and mood progress with clean, easy-to-read charts."
          />
          <FeatureCard 
            icon={<FileText className="w-6 h-6" />}
            title="Medical Report Simplifier"
            description="Upload PDFs/images and get simple, jargon-free explanations."
          />
        </motion.div>
      </main>

      <footer className="w-full border-t border-border-color py-8 mt-auto z-10 bg-background/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-xs sm:text-sm text-text-secondary font-medium">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>© 2026 Wellora AI. Built for wellness.</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-text-sky transition-colors">Privacy</Link>
            <Link to="/login" className="hover:text-text-sky transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
