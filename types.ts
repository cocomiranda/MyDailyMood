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
  { name: 'Cheerful', color: '#FFD93D' },
  { name: 'Grateful', color: '#FFD700' },
  { name: 'Inspired', color: '#BA68C8' },
  { name: 'Playful', color: '#FFB74D' },
  { name: 'Content', color: '#AED581' },
  { name: 'Excited', color: '#FF8A65' },
  { name: 'Curious', color: '#F6E05E' },
  { name: 'Thoughtful', color: '#40C057' },
  { name: 'Bored', color: '#74C0FC' },
  { name: 'Indifferent', color: '#A0AEC0' },
  { name: 'Observant', color: '#81A1C1' },
  { name: 'Contemplative', color: '#718096' },
  { name: 'Calm', color: '#8CE99A' },
  { name: 'Chill', color: '#2F9E44' },
  { name: 'Tense', color: '#FFA07A' },
  { name: 'Uneasy', color: '#FF7F50' },
  { name: 'Tired', color: '#4DABF7' },
  { name: 'Fatigued', color: '#339AF0' },
  { name: 'Anxious', color: '#FF7043' },
  { name: 'Lonely', color: '#90A4AE' },
  { name: 'Overwhelmed', color: '#8D6E63' },
  { name: 'Frustrated', color: '#D32F2F' }
];
