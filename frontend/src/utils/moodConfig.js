export const moodMap = {
  Happy: { name: 'Happy', emoji: '😊', color: 'green', textColor: 'text-green-600', bgColor: 'bg-green-100', activeClass: 'bg-green-500 text-white shadow-green-500/30' },
  Neutral: { name: 'Neutral', emoji: '😐', color: 'blue', textColor: 'text-blue-600', bgColor: 'bg-blue-100', activeClass: 'bg-blue-500 text-white shadow-blue-500/30' },
  Sad: { name: 'Sad', emoji: '😔', color: 'blue', textColor: 'text-blue-600', bgColor: 'bg-blue-100', activeClass: 'bg-blue-500 text-white shadow-blue-500/30' },
  Tired: { name: 'Tired', emoji: '😴', color: 'orange', textColor: 'text-orange-600', bgColor: 'bg-orange-100', activeClass: 'bg-orange-500 text-white shadow-orange-500/30' },
  Stressed: { name: 'Stressed', emoji: '😣', color: 'red', textColor: 'text-red-600', bgColor: 'bg-red-100', activeClass: 'bg-red-500 text-white shadow-red-500/30' }
};

export const MOODS = Object.values(moodMap);
