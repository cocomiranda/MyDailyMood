export interface MoodEntry {
  id: string;
  emotion: string;
  timestamp: number;
}

export interface MoodStats {
  week: Record<string, number>;
  month: Record<string, number>;
  year: Record<string, number>;
}

export interface EmotionData {
  name: string;
  color: string;
}

export const EMOTIONS: EmotionData[] = [
  // Reds/Oranges
  { name: 'Hopeful', color: '#FF6B6B' },
  { name: 'Confident', color: '#FF8787' },
  { name: 'Tense', color: '#FFA07A' },
  { name: 'Uneasy', color: '#FF7F50' },
  
  // Yellows
  { name: 'Cheerful', color: '#FFD93D' },
  { name: 'Curious', color: '#F6E05E' },
  { name: 'Pleasant', color: '#FFD700' },
  { name: 'Pleased', color: '#FFC107' },
  { name: 'Playful', color: '#FFB74D' },
  
  // Blues
  { name: 'Bored', color: '#74C0FC' },
  { name: 'Tired', color: '#4DABF7' },
  { name: 'Fatigued', color: '#339AF0' },
  
  // Greens
  { name: 'Calm', color: '#8CE99A' },
  { name: 'Good', color: '#69DB7C' },
  { name: 'Thoughtful', color: '#40C057' },
  { name: 'Chill', color: '#2F9E44' }
];
