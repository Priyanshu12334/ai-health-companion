export const moodMap = {
  Happy: { 
    name: 'Happy', 
    emoji: '😊', 
    iconUrl: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Smiling%20face%20with%20smiling%20eyes/3D/smiling_face_with_smiling_eyes_3d.png',
    color: 'green', 
    textColor: 'text-green-600', 
    bgColor: 'bg-green-100 dark:bg-green-950/30', 
    activeClass: 'bg-green-500 text-white shadow-green-500/30' 
  },
  Neutral: { 
    name: 'Neutral', 
    emoji: '😐', 
    iconUrl: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Neutral%20face/3D/neutral_face_3d.png',
    color: 'blue', 
    textColor: 'text-sky-600', 
    bgColor: 'bg-sky-100 dark:bg-sky-950/30', 
    activeClass: 'bg-sky-500 text-white shadow-sky-500/30' 
  },
  Sad: { 
    name: 'Sad', 
    emoji: '😔', 
    iconUrl: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Pensive%20face/3D/pensive_face_3d.png',
    color: 'blue', 
    textColor: 'text-blue-600', 
    bgColor: 'bg-blue-100 dark:bg-blue-950/30', 
    activeClass: 'bg-blue-500 text-white shadow-blue-500/30' 
  },
  Tired: { 
    name: 'Tired', 
    emoji: '😴', 
    iconUrl: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sleeping%20face/3D/sleeping_face_3d.png',
    color: 'orange', 
    textColor: 'text-orange-600', 
    bgColor: 'bg-orange-100 dark:bg-orange-950/30', 
    activeClass: 'bg-orange-500 text-white shadow-orange-500/30' 
  },
  Stressed: { 
    name: 'Stressed', 
    emoji: '😣', 
    iconUrl: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Persevering%20face/3D/persevering_face_3d.png',
    color: 'red', 
    textColor: 'text-red-600', 
    bgColor: 'bg-red-100 dark:bg-red-950/30', 
    activeClass: 'bg-red-500 text-white shadow-red-500/30' 
  }
};

export const MOODS = Object.values(moodMap);
