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
  { name: 'Hopeful', color: '#FF6B6B' },
  { name: 'Confident', color: '#FF8787' },
  { name: 'Excited', color: '#FF8A65' },
  { name: 'Anxious', color: '#FF7043' },
  { name: 'Uneasy', color: '#FF7F50' },
  { name: 'Tense', color: '#FFA07A' },
  { name: 'Playful', color: '#FFB74D' },
  { name: 'Pleased', color: '#FFC107' },
  { name: 'Grateful', color: '#FFD700' },
  { name: 'Pleasant', color: '#FFD700' },
  { name: 'Cheerful', color: '#FFD93D' },
  { name: 'Curious', color: '#F6E05E' },
  { name: 'Thoughtful', color: '#40C057' },
  { name: 'Good', color: '#69DB7C' },
  { name: 'Content', color: '#AED581' },
  { name: 'Calm', color: '#8CE99A' },
  { name: 'Chill', color: '#2F9E44' },
  { name: 'Motivated', color: '#00B8D4' },
  { name: 'Fatigued', color: '#339AF0' },
  { name: 'Tired', color: '#4DABF7' },
  { name: 'Bored', color: '#74C0FC' },
  { name: 'Inspired', color: '#BA68C8' },
  { name: 'Lonely', color: '#90A4AE' },
  { name: 'Overwhelmed', color: '#8D6E63' }
];
