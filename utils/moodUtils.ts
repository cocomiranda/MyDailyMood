import { MoodEntry, Emotion } from '../types';

const STORAGE_KEY = 'mood-tracker-entries';

export const saveMoodEntry = (emotion: Emotion) => {
  const entries = getMoodEntries();
  const newEntry: MoodEntry = {
    id: crypto.randomUUID(),
    emotion,
    timestamp: Date.now(),
  };
  entries.push(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return newEntry;
};

export const getMoodEntries = (): MoodEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const calculateStats = (entries: MoodEntry[]) => {
  const now = new Date();
  const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const oneYearAgo = now.getTime() - 365 * 24 * 60 * 60 * 1000;

  const stats = {
    week: {} as Record<string, number>,
    month: {} as Record<string, number>,
    year: {} as Record<string, number>,
  };

  entries.forEach(entry => {
    if (entry.timestamp >= oneWeekAgo) {
      stats.week[entry.emotion] = (stats.week[entry.emotion] || 0) + 1;
    }
    if (entry.timestamp >= oneMonthAgo) {
      stats.month[entry.emotion] = (stats.month[entry.emotion] || 0) + 1;
    }
    if (entry.timestamp >= oneYearAgo) {
      stats.year[entry.emotion] = (stats.year[entry.emotion] || 0) + 1;
    }
  });

  return stats;
}; 