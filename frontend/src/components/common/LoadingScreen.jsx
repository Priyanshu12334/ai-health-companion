import React, { useState, useEffect } from 'react';
import { HeartPulse, Loader2 } from 'lucide-react';

const LOADING_MESSAGES = [
  "Analyzing your health data...",
  "Preparing your wellness dashboard...",
  "Generating personalized insights...",
  "Loading your progress...",
  "Getting Aurora ready..."
];

const LoadingScreen = () => {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Wait 300ms before showing the loader to prevent flashing
    const timer = setTimeout(() => {
      setShow(true);
      // Trigger fade in slightly after mounting
      setTimeout(() => setFade(true), 50);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Set a random initial message
    setMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    
    // Rotate messages every 2.5 seconds
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
        {/* Logo and Name */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-4 bg-sky-600 rounded-full text-white shadow-xl shadow-sky-600/30">
            <HeartPulse className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Aurora</h1>
        </div>

        {/* Spinner */}
        <div className="mb-6">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        </div>

        {/* Loading Text */}
        <div className="h-8 relative w-full overflow-hidden flex justify-center items-center">
          <p className="text-text-secondary font-medium transition-opacity duration-300">
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
