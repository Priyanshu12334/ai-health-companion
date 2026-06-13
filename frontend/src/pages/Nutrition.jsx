import React, { useState, useEffect } from 'react';
import { Search, Apple, Sparkles, ChefHat, Activity, Heart, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Nutrition = () => {
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(true);
  const [foodResult, setFoodResult] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [errorText, setErrorText] = useState('');

  const [preference, setPreference] = useState(localStorage.getItem('nutritionPreference') || 'vegetarian');

  // Fetch meal suggestions on load or when preference changes
  const fetchMealSuggestions = async (pref = preference) => {
    try {
      setSuggestionLoading(true);
      const dashboardHealthScore = localStorage.getItem('dashboardHealthScore') !== null
        ? Number(localStorage.getItem('dashboardHealthScore'))
        : 0;
      const res = await api.get(`/nutrition/suggestions?preference=${pref}&healthScore=${dashboardHealthScore}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to load meal suggestions', err);
    } finally {
      setSuggestionLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('nutritionPreference', preference);
    fetchMealSuggestions(preference);
  }, [preference]);

  const handleSearch = async (e, searchQuery = query) => {
    if (e) e.preventDefault();

    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) {
      toast.warn('Search query is required');
      setErrorText('Search for a food item');
      setFoodResult(null);
      setAlternatives([]);
      return;
    }

    setSearchLoading(true);
    setErrorText('');
    try {
      const res = await api.get(`/nutrition/search?q=${encodeURIComponent(cleanQuery)}`);
      setFoodResult(res.data.data);
      setAlternatives(res.data.alternatives || []);
    } catch (err) {
      console.error(err);
      setFoodResult(null);
      setAlternatives([]);
      setErrorText('Unable to fetch nutrition information.');
      toast.error(err.response?.data?.message || 'Food search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  // Helper to color code health rating
  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
    if (rating >= 5) return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      <header className="mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Apple className="text-red-500 fill-red-500" /> Nutrition Coach
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Get instant nutrition insights, healthier food choices, and personalized meal recommendations tailored to your wellness journey.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left/Main Section: Search & Results */}
        <div className="md:col-span-2 space-y-6">
          {/* Search Bar */}
          <div className="glass-card p-6">
            <form onSubmit={e => handleSearch(e)} className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search food item (e.g. Samosa, Oats, Egg, Avocado)..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-transparent focus:border-sky-500 focus:bg-card outline-none transition-all duration-200 text-text-sky text-sm"
                />
                <Search className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0 text-sm"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {errorText && (
              <p className="text-sm text-center text-rose-500 mt-4 font-medium">
                {errorText}
              </p>
            )}

            {!foodResult && !searchLoading && !errorText && (
              <p className="text-sm text-center text-text-secondary mt-4">
                Search any food, meal, snack, fruit, or beverage to view nutrition facts and health recommendations.
              </p>
            )}
          </div>

          {/* Search Loader Skeleton */}
          {searchLoading && (
            <div className="animate-pulse glass-card p-6 space-y-4">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                ))}
              </div>
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          )}

          {/* Nutrition Information & Recommendation Cards */}
          {foodResult && !searchLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Food Card */}
              <div className="glass-card p-6 space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="text-2xl font-bold text-text-sky capitalize">{foodResult.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                        Category: {foodResult.category}
                      </span>
                      <span className="text-xs text-white bg-sky-500 px-2 py-0.5 rounded-full font-bold">
                        {foodResult.category === 'AI Analysis' ? 'AI Sourced' : 'Verified'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Health Rating Pill */}
                  <div className={`border px-3.5 py-1.5 rounded-2xl flex flex-col items-center shrink-0 ${getRatingColor(foodResult.healthRating)}`}>
                    <span className="text-lg font-black leading-none">{foodResult.healthRating} <span className="text-xs font-normal">/ 10</span></span>
                    <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Health Rating</span>
                  </div>
                </div>

                {/* Macro values Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-surface/50 dark:bg-slate-900/20 border border-border-color p-3 rounded-xl text-center">
                    <span className="text-xs text-text-secondary block">Calories</span>
                    <span className="text-xl font-bold text-text-sky block mt-1">{foodResult.calories} kcal</span>
                  </div>
                  <div className="bg-surface/50 dark:bg-slate-900/20 border border-border-color p-3 rounded-xl text-center">
                    <span className="text-xs text-text-secondary block">Protein</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1">{foodResult.protein}</span>
                  </div>
                  <div className="bg-surface/50 dark:bg-slate-900/20 border border-border-color p-3 rounded-xl text-center">
                    <span className="text-xs text-text-secondary block">Carbs</span>
                    <span className="text-xl font-bold text-amber-600 dark:text-amber-500 block mt-1">{foodResult.carbs}</span>
                  </div>
                  <div className="bg-surface/50 dark:bg-slate-900/20 border border-border-color p-3 rounded-xl text-center">
                    <span className="text-xs text-text-secondary block">Fats</span>
                    <span className="text-xl font-bold text-rose-500 block mt-1">{foodResult.fats}</span>
                  </div>
                </div>

                {/* Recommendation Panel */}
                <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-xl flex items-start gap-3">
                  <Activity className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-sky-700 dark:text-sky-400">Recommendation</h4>
                    <p className="text-sm text-text-sky leading-relaxed mt-1">
                      {foodResult.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested Alternatives Card */}
              {alternatives.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6 space-y-4"
                >
                  <h3 className="font-bold text-lg text-text-sky flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" /> Suggested Healthy Alternatives
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Consider these nutrient-dense options in the same category to support your wellness goals:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {alternatives.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setQuery(item.name);
                          handleSearch(null, item.name);
                        }}
                        className="p-3 bg-surface hover:bg-slate-200 dark:hover:bg-slate-800/60 border border-border-color hover:border-sky-500/50 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-sm text-text-sky capitalize truncate">{item.name}</span>
                          <span className="text-xs bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-md font-extrabold leading-none shrink-0">{item.healthRating}/10</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-text-secondary mt-3">
                          <span>{item.calories} kcal</span>
                          <span className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400 font-bold hover:underline">
                            Search <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Section: Meal Suggestions (Featured Recommendation Card) */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-sky-600 to-sky-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <ChefHat className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-yellow-300" /> Meal Recommendations
              </h3>

              {/* Food Preference Selector */}
              <div className="flex items-center justify-between bg-white/10 p-1.5 rounded-xl text-xs">
                <span className="text-white/80 font-medium ml-1">Preference</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreference('vegetarian')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      preference === 'vegetarian'
                        ? 'bg-white text-sky-700 shadow-sm'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Vegetarian
                  </button>
                  <button
                    onClick={() => setPreference('non-vegetarian')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      preference === 'non-vegetarian'
                        ? 'bg-white text-sky-700 shadow-sm'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Non-Veg
                  </button>
                </div>
              </div>

              {suggestionLoading ? (
                <div className="animate-pulse space-y-4 pt-2">
                  <div className="h-4 w-2/3 bg-white/20 rounded"></div>
                  <div className="h-10 bg-white/20 rounded-xl"></div>
                  <div className="h-10 bg-white/20 rounded-xl"></div>
                  <div className="h-10 bg-white/20 rounded-xl"></div>
                </div>
              ) : suggestions ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                      <span className="text-xs text-white/70">Based on Health Score</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{suggestions.score} %</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 block">🍳 Breakfast Suggestion</span>
                      <span className="text-sm font-semibold block mt-0.5">{suggestions.breakfast}</span>
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 block">🍛 Lunch Suggestion</span>
                      <span className="text-sm font-semibold block mt-0.5">{suggestions.lunch}</span>
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 block">🥗 Dinner Suggestion</span>
                      <span className="text-sm font-semibold block mt-0.5">{suggestions.dinner}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl border border-white/5 text-xs italic text-center text-white/95">
                    "{suggestions.advice}"
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/75 pt-2">
                  Log sleep, water, and mood on the dashboard to calculate meal recommendations.
                </p>
              )}
            </div>
          </div>

          {/* Quick FAQ info panel removed */}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
