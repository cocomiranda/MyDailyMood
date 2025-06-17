import React, { useState, useEffect, useRef } from 'react'
import { EMOTIONS } from './types'
import { MoodStats, MoodEntry } from './types'
import { saveMoodEntry, getMoodEntries, calculateStats, hasEntryForToday } from './utils/moodUtils'
import './App.css'
import { Analytics } from "@vercel/analytics/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';


const DayStreak = ({ moodEntries }: { moodEntries: MoodEntry[] }) => {
  const [streak, setStreak] = useState(0);
  const days = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

  useEffect(() => {
    const calculateStreak = () => {
      const today = new Date();
      let currentStreak = 0;
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const hasEntry = moodEntries.some(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate.toDateString() === date.toDateString();
        });
        
        if (hasEntry) {
          currentStreak++;
        } else if (i === 0) {
          continue; // Skip today if no entry yet
        } else {
          break; // Stop counting at first gap
        }
      }
      setStreak(currentStreak);
    };

    calculateStreak();
  }, [moodEntries]);

  if (streak === 0) return null;

  const getStreakEmoji = () => {
    if (streak >= 30) return '🌈';
    if (streak >= 7) return '🧠';
    return '🔥';
  };

  const getStreakText = () => {
    if (streak >= 30) return 'day streak';
    if (streak >= 7) return 'day streak';
    return 'day streak';
  };

  return (
    <div className="streak-container">
      <div className="streak-flame">
        <span className="streak-number">{getStreakEmoji()} {streak}</span>
        <span className="streak-text">{getStreakText()}</span>
      </div>
    </div>
  );
};

// DonutChart component for stats
const COLORS = [
  '#FFD600', // Happy
  '#FF5252', // Romantic
  '#4FC3F7', // Calm
  '#81C784', // Other colors as needed
  '#FFB300', '#BA68C8', '#FF8A65', '#A1887F', '#90A4AE', '#F06292'
];

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
}) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const color = COLORS[index % COLORS.length];
  return (
    <text
      x={x}
      y={y}
      fill={color}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function DonutChart({ data }: { data: { emotion: string, count: number }[] }) {
  // Get color for each mood from CSS variable
  const getColor = (emotion: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(`--${emotion.toLowerCase()}-color`).trim() || '#8884d8';
  return (
    <div style={{ width: '100%', maxWidth: 220, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="emotion"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            fill="#8884d8"
            label={false}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.emotion} fill={getColor(entry.emotion)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, gap: 2 }}>
        {data.map((entry) => (
          <span key={entry.emotion} style={{ color: getColor(entry.emotion), fontSize: 13, fontWeight: 500 }}>
            {entry.emotion} {((entry.count / data.reduce((a, b) => a + b.count, 0)) * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}
function scheduleDailyNotification() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(permission => {
    if (permission !== 'granted') return;
    const now = new Date();
    const target = new Date();
    target.setHours(18, 40, 0, 0); // 11:30 local time
    if (now > target) {
      // If it's already past 11:30 today, schedule for tomorrow
      target.setDate(target.getDate() + 1);
    }
    const msUntilTarget = target.getTime() - now.getTime();
    // Avoid multiple notifications in one day
    const lastNotified = localStorage.getItem('lastMoodNotification');
    const todayStr = target.toDateString();
    if (lastNotified === todayStr) return;
    setTimeout(() => {
      new Notification('Daily Mood Tracking', {
        body: 'Make sure to track your mood today!',
        icon: '/icon-192.png', // Optional: update to your app icon path
      });
      localStorage.setItem('lastMoodNotification', todayStr);
    }, msUntilTarget);
  });
}

const moodMessages: Record<string, string> = {
  Hopeful: "The future holds great possibilities — keep moving forward.",
  Confident: "You're on the right path. Own it!",
  Tense: "Try to let go a little. Even small pauses can help.",
  Uneasy: "Not every day feels steady — you're doing your best.",
  Cheerful: "Let that lightness brighten someone else's day too.",
  Curious: "Asking questions is how we grow — keep exploring.",
  Pleasant: "Sometimes the simple days are the best ones.",
  Pleased: "It's nice when things just feel right, isn't it?",
  Playful: "A little fun can go a long way. Keep the joy alive.",
  Bored: "Shake things up — even small changes can spark excitement.",
  Tired: "Your body and mind deserve some kindness and rest.",
  Fatigued: "Slow down — you don't have to do it all at once.",
  Calm: "Peace is powerful. Let it linger a while.",
  Good: "Things don't have to be extraordinary to be meaningful.",
  Thoughtful: "Your reflection today might spark someone's tomorrow.",
  Chill: "Staying cool under pressure is a quiet kind of strength."
};

function getColor(emotion: string | null) {
  if (!emotion) return '#e0e0e0'; // grey for blank
  return getComputedStyle(document.documentElement).getPropertyValue(`--${emotion.toLowerCase()}-color`).trim() || '#8884d8';
}

function getDaysArray(range: 'week' | 'month' | 'year') {
  const today = new Date();
  if (range === 'year') {
    const yearlyData = [];
    const currentYear = today.getFullYear();

    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(currentYear, month, 1);
      const lastDayOfMonth = new Date(currentYear, month + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // 0 for Monday, 1 for Tuesday, etc.

      const monthDays = [];

      // Add nulls for padding at the beginning of the month to align with weekday
      for (let i = 0; i < firstDayWeekday; i++) {
        monthDays.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        date.setHours(0, 0, 0, 0);
        monthDays.push(date);
      }
      yearlyData.push(monthDays);
    }
    return yearlyData;

  } else {
    let days = 7;
    if (range === 'month') days = 30;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }
}

function DotsGrid({ moodEntries, range }: { moodEntries: MoodEntry[]; range: 'week' | 'month' | 'year' }) {
  const data = getDaysArray(range);
  // Map date string to emotion
  const entryMap = Object.fromEntries(
    moodEntries.map(e => [new Date(e.timestamp).toDateString(), e.emotion])
  );
  // Responsive columns and dot size
  let columns = 7, dot = 16, gap = 4, gridWidth: number | string | undefined = 180, fullWidth = false;

  if (range === 'year') { 
    columns = 7; // Calendar view will have 7 columns (days of week)
    dot = 8;     // Smaller dots for yearly view
    gap = 2;     // Smaller gap

    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px', // Gap between months
        width: '100%',
        margin: '0 auto',
      }}>
        {(data as (Date | null)[][]).map((monthDays, monthIndex) => (
          <div key={monthIndex} style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gap,
            width: `calc(${columns} * ${dot}px + (${columns} - 1) * ${gap}px)`, // width for 7 dots and their gaps
            boxSizing: 'content-box',
          }}>
            {monthDays.map((date, i) => (
              <div
                key={date ? date.toISOString() : `empty-${monthIndex}-${i}`}
                title={date ? date.toDateString() + (entryMap[date.toDateString()] ? `: ${entryMap[date.toDateString()]}` : '') : ''}
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: '50%',
                  background: date ? getColor(entryMap[date.toDateString()] || null) : 'transparent',
                  border: date ? '1px solid #ccc' : 'none',
                  margin: 0,
                  display: 'inline-block',
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );

  } else {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)` ,
        gap,
        justifyContent: 'center',
        margin: '0 auto',
        maxWidth: gridWidth,
        width: fullWidth ? '100%' : gridWidth,
        marginTop: 12
      }}>
        {(data as Date[]).map((date, i) => (
          <div
            key={date.toISOString()}
            title={date.toDateString() + (entryMap[date.toDateString()] ? `: ${entryMap[date.toDateString()]}` : '')}
            style={{
              width: dot,
              height: dot,
              borderRadius: '50%',
              background: getColor(entryMap[date.toDateString()] || null),
              border: '1px solid #ccc',
              margin: 0,
              display: 'inline-block',
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>
    );
  }
}

// Message templates for variety
const positiveTemplates = [
  "you've been radiating positive energy.",
  "your days have been filled with uplifting emotions.",
  "positivity has been your main vibe.",
  "you've shown a lot of optimism.",
  "your mood has been mostly on the bright side.",
  "you've been embracing the good moments.",
  "your spirit has been shining.",
  "you've kept a positive outlook.",
  "joy and hope have been frequent companions.",
  "you've been experiencing predominantly positive emotions."
];
const challengingTemplates = [
  "you've faced some challenging moments.",
  "it's been a period with a few emotional hurdles.",
  "you've encountered some tough days.",
  "there have been some emotional ups and downs.",
  "you've been working through some challenges.",
  "not every day has been easy, but you're moving forward.",
  "you've shown resilience through difficult times.",
  "you've had to navigate some rough patches.",
  "it's been a time of growth through adversity.",
  "you've had some challenging emotions recently."
];
const balancedTemplates = [
  "your emotional state has been quite balanced.",
  "you've maintained a steady emotional course.",
  "your moods have been a mix of highs and lows.",
  "you've experienced a healthy emotional balance.",
  "your feelings have been well-rounded.",
  "you've kept things in emotional equilibrium.",
  "your mood has been stable overall.",
  "you've shown a good mix of emotions.",
  "your emotional journey has been even-keeled.",
  "you've had a balanced emotional experience."
];

// Define friendly messages for repetitive emotions (progressively shorter versions)
const friendlyRepetitiveMessages = [
  (emotion: string, count: number, dayName: string) => `It looks like ${emotion} was a recurring theme on ${dayName}s, happening ${count} times. Keep an eye on that pattern.`,
  (emotion: string, count: number, dayName: string) => `You consistently felt ${emotion} on ${dayName}s, ${count} times. Interesting!`,
  (emotion: string, count: number, dayName: string) => `Trend: ${emotion} ${count} times on ${dayName}s.`,
  (emotion: string, count: number, dayName: string) => `${emotion} on ${dayName}s, ${count}x.`,
  (emotion: string, count: number, dayName: string) => `${emotion} x${count}.`,
];

function App() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(getMoodEntries());
  const [stats, setStats] = useState<MoodStats>(calculateStats(moodEntries));
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | null>(null)
  const [chartView, setChartView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dotsView, setDotsView] = useState(false);
  const [showAllMoods, setShowAllMoods] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [textareaRows, setTextareaRows] = useState(2);
  const [isLoadingBlueprint, setIsLoadingBlueprint] = useState(false);
  const [thinkingDots, setThinkingDots] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const match = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(match.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    match.addEventListener('change', handler);
    return () => match.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    setStats(calculateStats(moodEntries));
  }, [moodEntries]);

  useEffect(() => {
    scheduleDailyNotification();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoadingBlueprint) {
      interval = setInterval(() => {
        setThinkingDots(prev => (prev + 1) % 4);
      }, 300);
    } else {
      setThinkingDots(0);
    }
    return () => clearInterval(interval);
  }, [isLoadingBlueprint]);

  const handleEmotionClick = (emotion: string) => {
    if (hasEntryForToday(moodEntries)) {
      alert("Oops! You've already logged your mood today — Come back tomorrow!")
      return
    }
    saveMoodEntry(emotion)
    const updatedEntries = getMoodEntries();
    setMoodEntries(updatedEntries);
    alert("Thanks for checking in — you're all set for today!")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Add function to generate AI summary
  const generateMoodSummary = (entries: MoodEntry[], timeRange: 'week' | 'month' | 'year' | null) => {
    if (entries.length === 0) return "No mood entries yet. Start tracking your moods to get insights!";

    // Group emotions by category
    const emotionCategories = {
      positive: ['Hopeful', 'Confident', 'Excited', 'Playful', 'Grateful', 'Cheerful', 'Content', 'Inspired'],
      neutral: ['Curious', 'Calm', 'Chill', 'Thoughtful', 'Bored', 'Observant', 'Indifferent', 'Contemplative'],
      challenging: ['Frustrated', 'Anxious', 'Uneasy', 'Tense', 'Tired', 'Fatigued', 'Lonely', 'Overwhelmed']
    };

    // Count emotions by category
    const categoryCounts = entries.reduce((acc, entry) => {
      if (emotionCategories.positive.includes(entry.emotion)) acc.positive++;
      else if (emotionCategories.neutral.includes(entry.emotion)) acc.neutral++;
      else if (emotionCategories.challenging.includes(entry.emotion)) acc.challenging++;
      return acc;
    }, { positive: 0, neutral: 0, challenging: 0 });

    // Calculate percentages
    const total = entries.length;
    const positivePercent = (categoryCounts.positive / total) * 100;
    const neutralPercent = (categoryCounts.neutral / total) * 100;
    const challengingPercent = (categoryCounts.challenging / total) * 100;

    // Find most common emotions
    const emotionCounts = entries.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => `${emotion}`);

    // Add time frame reference
    let timeFrameText = '';
    if (timeRange === 'week') timeFrameText = 'this week';
    else if (timeRange === 'month') timeFrameText = 'the past month';
    else if (timeRange === 'year') timeFrameText = 'the last year';
    else timeFrameText = 'this period';

    // Randomly select a template
    let scenarioTemplates;
    if (positivePercent > 60) scenarioTemplates = positiveTemplates;
    else if (challengingPercent > 40) scenarioTemplates = challengingTemplates;
    else scenarioTemplates = balancedTemplates;
    const randomTemplate = scenarioTemplates[Math.floor(Math.random() * scenarioTemplates.length)];

    // Generate summary text
    let summary = `For ${timeFrameText}, ${randomTemplate} `;
    summary += `Your most frequent emotions were ${topEmotions.join(', ')}.\n\n`;

    if (timeRange === 'month') {
      // Add logic to check for repetitive emotions on the same day of the week
      const repetitiveEmotions = new Map();

      entries.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dayOfWeek = date.getDay();
        const key = `${dayOfWeek}-${entry.emotion}`;
        repetitiveEmotions.set(key, (repetitiveEmotions.get(key) || 0) + 1);
      });

      // Update logic to use first message for first occurrence, and combine subsequent ones
      let repetitiveEmotionNotes: string[] = [];
      const repetitiveEntriesData: { dayName: string; emotion: string; count: number }[] = [];

      repetitiveEmotions.forEach((count, key) => {
        if (count >= 2) {
          const [dayOfWeek, emotion] = key.split('-');
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(dayOfWeek)];
          repetitiveEntriesData.push({ dayName, emotion, count });
        }
      });

      if (repetitiveEntriesData.length > 0) {
        // First repetitive emotion
        const firstEntry = repetitiveEntriesData[0];
        const firstMessage = friendlyRepetitiveMessages[0](firstEntry.emotion, firstEntry.count, firstEntry.dayName);
        repetitiveEmotionNotes.push(firstMessage);

        // Subsequent repetitive emotions
        if (repetitiveEntriesData.length > 1) {
          const otherEntries = repetitiveEntriesData.slice(1);
          const dayNames = otherEntries.map(entry => `${entry.dayName}s`);
          const emotionsList = otherEntries.map(entry => entry.emotion);

          let combinedOtherMessage = `This is also happening on ${dayNames.join(' and ')}`; // Start with days
          if (emotionsList.length > 0) {
            combinedOtherMessage += `, showing emotions ${emotionsList.join(' and ')} respectively.`;
          }

          repetitiveEmotionNotes.push(combinedOtherMessage);
        }
      }

      if (repetitiveEmotionNotes.length > 0) {
        summary += `\n${repetitiveEmotionNotes.join('\n')}\n`;
      }
    }

    if (timeRange === 'year') {
      // Repeated emotions by day of month for year timeframe
      const dayOfMonthEmotions = entries.reduce((acc, entry) => {
        const date = new Date(entry.timestamp);
        const dayOfMonth = date.getDate();
        if (!acc[dayOfMonth]) acc[dayOfMonth] = {};
        acc[dayOfMonth][entry.emotion] = (acc[dayOfMonth][entry.emotion] || 0) + 1;
        return acc;
      }, {} as Record<number, Record<string, number>>);

      const repeatedEmotions = Object.entries(dayOfMonthEmotions)
        .filter(([_, emotions]) => Object.values(emotions).some(count => count >= 2))
        .map(([dayOfMonth, emotions]) => {
          const repeated = Object.entries(emotions)
            .filter(([_, count]) => count >= 2)
            .map(([emotion, count]) => ({ emotion, count })); // Store as object to sort by count
          
          // Calculate total count for sorting this pattern
          const totalCount = repeated.reduce((sum, item) => sum + item.count, 0);
          return { dayOfMonth: parseInt(dayOfMonth), patterns: repeated, totalCount };
        })
        .sort((a, b) => b.totalCount - a.totalCount) // Sort by total count of occurrences
        .slice(0, 2); // Take only the top 2

      if (repeatedEmotions.length > 0) {
        summary += "You've shown some consistent patterns:\n";
        repeatedEmotions.forEach(patternData => {
          const patternsText = patternData.patterns.map(p => `${p.emotion} (${p.count} times)`).join(', ');
          summary += `• Day ${patternData.dayOfMonth}: ${patternsText}\n`;
        });
        summary += '\n';
      }

      // Largest positive and challenging streaks for year timeframe
      const getEmotionGroup = (emotion: string) => {
        if (emotionCategories.positive.includes(emotion)) return 'positive';
        if (emotionCategories.neutral.includes(emotion)) return 'neutral';
        if (emotionCategories.challenging.includes(emotion)) return 'challenging';
        return null;
      };

      const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
      const allStreaks: { length: number; group: string | null; startDate: Date }[] = [];
      
      if (sortedEntries.length > 0) {
        let currentStreak = 1;
        let currentGroup = getEmotionGroup(sortedEntries[0].emotion);
        let currentStreakStartDate = new Date(sortedEntries[0].timestamp);

        for (let i = 1; i < sortedEntries.length; i++) {
          const group = getEmotionGroup(sortedEntries[i].emotion);
          if (group === currentGroup) {
            currentStreak++;
          } else {
            if (currentStreak >= 4) {
              allStreaks.push({ length: currentStreak, group: currentGroup, startDate: currentStreakStartDate });
            }
            currentStreak = 1;
            currentGroup = group;
            currentStreakStartDate = new Date(sortedEntries[i].timestamp);
          }
        }
        // Push the last streak if it meets the criteria
        if (currentStreak >= 4) {
          allStreaks.push({ length: currentStreak, group: currentGroup, startDate: currentStreakStartDate });
        }
      }

      const largestPositiveStreak = allStreaks
        .filter(streak => streak.group === 'positive')
        .sort((a, b) => b.length - a.length)[0];

      const largestChallengingStreak = allStreaks
        .filter(streak => streak.group === 'challenging')
        .sort((a, b) => b.length - a.length)[0];

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      if (largestPositiveStreak) {
        const month = monthNames[largestPositiveStreak.startDate.getMonth()];
        summary += `Your largest positive streak was ${largestPositiveStreak.length} days in ${month}.\n`;
      }

      if (largestChallengingStreak) {
        const month = monthNames[largestChallengingStreak.startDate.getMonth()];
        summary += `Your largest challenging streak was ${largestChallengingStreak.length} days in ${month}.\n`;
      }

    } else if (timeRange === 'month') {
      // Repeated emotions by day of month for month timeframe
      const dayOfMonthEmotions = entries.reduce((acc, entry) => {
        const date = new Date(entry.timestamp);
        const dayOfMonth = date.getDate();
        if (!acc[dayOfMonth]) acc[dayOfMonth] = {};
        acc[dayOfMonth][entry.emotion] = (acc[dayOfMonth][entry.emotion] || 0) + 1;
        return acc;
      }, {} as Record<number, Record<string, number>>);

      const repeatedEmotions = Object.entries(dayOfMonthEmotions)
        .filter(([_, emotions]) => Object.values(emotions).some(count => count >= 2))
        .map(([dayOfMonth, emotions]) => {
          const repeated = Object.entries(emotions)
            .filter(([_, count]) => count >= 2)
            .map(([emotion, count]) => ({ emotion, count }));
          
          const totalCount = repeated.reduce((sum, item) => sum + item.count, 0);
          return { dayOfMonth: parseInt(dayOfMonth), patterns: repeated, totalCount };
        })
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, 2);

      if (repeatedEmotions.length > 0) {
        summary += "You've shown some consistent patterns:\n";
        repeatedEmotions.forEach(patternData => {
          const patternsText = patternData.patterns.map(p => `${p.emotion} (${p.count} times)`).join(', ');
          summary += `• Day ${patternData.dayOfMonth}: ${patternsText}\n`;
        });
        summary += '\n';
      }

      // Largest streak for month timeframe
      const getEmotionGroup = (emotion: string) => {
        if (emotionCategories.positive.includes(emotion)) return 'positive';
        if (emotionCategories.neutral.includes(emotion)) return 'neutral';
        if (emotionCategories.challenging.includes(emotion)) return 'challenging';
        return null;
      };

      const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
      let maxStreak = 0;
      let maxStreakGroup: string | null = null;

      if (sortedEntries.length > 0) {
        let currentStreak = 1;
        let currentGroup = getEmotionGroup(sortedEntries[0].emotion);

        for (let i = 1; i < sortedEntries.length; i++) {
          const group = getEmotionGroup(sortedEntries[i].emotion);
          if (group === currentGroup) {
            currentStreak++;
          } else {
            if (currentStreak > maxStreak) {
              maxStreak = currentStreak;
              maxStreakGroup = currentGroup;
            }
            currentStreak = 1;
            currentGroup = group;
          }
        }
        // Check the last streak
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStreakGroup = currentGroup;
        }
      }

      if (maxStreak >= 3) { // Consider streaks of 3 days or more for monthly view
        const groupName = maxStreakGroup === 'positive' ? 'positive' :
                          maxStreakGroup === 'challenging' ? 'challenging' :
                          'balanced';
        summary += `\nYou had your largest streak of ${maxStreak} days in ${groupName} emotions this month.\n\n`;
      }

    } else if (timeRange === 'week') {
      // Repetitive emotions by day of the week for week timeframe
      const weekdayEmotions = entries.reduce((acc, entry) => {
        const date = new Date(entry.timestamp);
        const weekday = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
        if (!acc[weekday]) acc[weekday] = {};
        acc[weekday][entry.emotion] = (acc[weekday][entry.emotion] || 0) + 1;
        return acc;
      }, {} as Record<number, Record<string, number>>);

      const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const repeatedWeekdayEmotions = Object.entries(weekdayEmotions)
        .filter(([_, emotions]) => Object.values(emotions).some(count => count >= 2))
        .map(([weekday, emotions]) => {
          const repeated = Object.entries(emotions)
            .filter(([_, count]) => count >= 2)
            .map(([emotion, count]) => `${emotion} (${count} times)`);
          return `${weekdayNames[parseInt(weekday)]}: ${repeated.join(', ')}`;
        });
      
      if (repeatedWeekdayEmotions.length > 0) {
        summary += "You've shown some consistent patterns this week:\n";
        repeatedWeekdayEmotions.forEach(pattern => {
          summary += `• ${pattern}\n`;
        });
        summary += '\n';
      }

      // Largest streak for week timeframe
      const getEmotionGroup = (emotion: string) => {
        if (emotionCategories.positive.includes(emotion)) return 'positive';
        if (emotionCategories.neutral.includes(emotion)) return 'neutral';
        if (emotionCategories.challenging.includes(emotion)) return 'challenging';
        return null;
      };

      const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
      let maxStreak = 0;
      let maxStreakGroup: string | null = null;

      if (sortedEntries.length > 0) {
        let currentStreak = 1;
        let currentGroup = getEmotionGroup(sortedEntries[0].emotion);

        for (let i = 1; i < sortedEntries.length; i++) {
          const group = getEmotionGroup(sortedEntries[i].emotion);
          if (group === currentGroup) {
            currentStreak++;
          } else {
            if (currentStreak > maxStreak) {
              maxStreak = currentStreak;
              maxStreakGroup = currentGroup;
            }
            currentStreak = 1;
            currentGroup = group;
          }
        }
        // Check the last streak
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStreakGroup = currentGroup;
        }
      }

      if (maxStreak >= 2) { // Consider streaks of 2 days or more for weekly view
        const groupName = maxStreakGroup === 'positive' ? 'positive' :
                          maxStreakGroup === 'challenging' ? 'challenging' :
                          'balanced';
        summary += `You had a ${maxStreak}-day streak of ${groupName} emotions this week.\n\n`;
      }
    }

    if (positivePercent > 70) {
      summary += "\n\nYou're maintaining a very positive outlook!";
    } else if (challengingPercent > 50) {
      summary += "\n\nRemember that challenging emotions are temporary and part of the human experience.";
    } else {
      summary += "\n\nYou're showing good emotional balance in your daily life.";
    }

    return summary;
  };

  return (
    <div className={`app${isDarkMode ? ' dark-mode' : ''}`}>
      <Analytics />
      <header className="header">
        <h1 className="app-title">DailyMood</h1>
        <p className="app-tagline">Little check-ins, big self-care.</p>
        <p className="date-display">{formatDate(new Date())}</p>
      </header>

      <div className="content-wrapper">
        {/* Swipable Mood Carousel */}
        <div className="emotion-bubbles">
          {EMOTIONS.map((emotion, index) => (
            <button
              key={emotion.name}
              className="emotion-bubble"
              onClick={() => handleEmotionClick(emotion.name)}
              style={{
                backgroundColor: emotion.color,
                '--animation-order': index,
              } as React.CSSProperties}
            >
              <span className="emotion-text">{emotion.name}</span>
            </button>
          ))}
        </div>

        <div className="stats-controls">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => {
              if (timeRange === 'week') {
                setTimeRange(null);
                setShowAllMoods(false);
              } else {
                setTimeRange('week');
                if (showAllMoods) {
                  setIsLoadingBlueprint(true);
                  setTimeout(() => {
                    setIsLoadingBlueprint(false);
                  }, 1000);
                }
              }
            }}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => {
              if (timeRange === 'month') {
                setTimeRange(null);
                setShowAllMoods(false);
              } else {
                setTimeRange('month');
                if (showAllMoods) {
                  setIsLoadingBlueprint(true);
                  setTimeout(() => {
                    setIsLoadingBlueprint(false);
                  }, 1000);
                }
              }
            }}
          >
            Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => {
              if (timeRange === 'year') {
                setTimeRange(null);
                setShowAllMoods(false);
              } else {
                setTimeRange('year');
                if (showAllMoods) {
                  setIsLoadingBlueprint(true);
                  setTimeout(() => {
                    setIsLoadingBlueprint(false);
                  }, 1000);
                }
              }
            }}
          >
            Year
          </button>
          {timeRange && (
            <button
              className={showAllMoods ? 'active ai-insights' : 'ai-insights'}
              onClick={() => {
                setShowAllMoods(!showAllMoods);
                setShowSummary(false);
                if (!showAllMoods) {
                  setIsLoadingBlueprint(true);
                  setTimeout(() => {
                    setIsLoadingBlueprint(false);
                  }, 1000);
                }
              }}
            >
              AI Insights
            </button>
          )}
        </div>
        {(timeRange || showAllMoods) && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', gap: 8 }}>
            <button
              className="toggle-chart-view"
              onClick={() => { setChartView(false); setDotsView(false); setShowAllMoods(false);}}
              style={{ fontSize: 12, padding: '2px 10px', border: (!chartView && !dotsView && !showAllMoods) ? '2px solid #333' : undefined }}
            >
              List
            </button>
            <button
              className="toggle-chart-view"
              onClick={() => { setChartView(true); setDotsView(false); setShowAllMoods(false);}}
              style={{ fontSize: 12, padding: '2px 10px', border: (chartView && !dotsView && !showAllMoods) ? '2px solid #333' : undefined }}
            >
              Chart View
            </button>
            <button
              className="toggle-chart-view"
              onClick={() => { setDotsView(true); setChartView(false); setShowAllMoods(false);}}
              style={{ fontSize: 12, padding: '2px 10px', border: (dotsView && !showAllMoods) ? '2px solid #333' : undefined }}
            >
              Dots View
            </button>
          </div>
        )}

        {showAllMoods ? (
          <div className="all-moods-list">
            <div className="mood-summary">
              <h4>Your Emotional Blueprint</h4>
              {isLoadingBlueprint ? (
                <div style={{ textAlign: 'center', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span>AI is thinking</span>
                  <span style={{ width: '24px', textAlign: 'left' }}>
                    {'.'.repeat(thinkingDots)}
                  </span>
                </div>
              ) : (
                <p style={{ whiteSpace: 'pre-line', textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {generateMoodSummary(
                    moodEntries.filter(entry => {
                      if (timeRange === 'week') {
                        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                        return entry.timestamp >= oneWeekAgo;
                      } else if (timeRange === 'month') {
                        const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                        return entry.timestamp >= oneMonthAgo;
                      } else if (timeRange === 'year') {
                        const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
                        return entry.timestamp >= oneYearAgo;
                      }
                      return false;
                    }),
                    timeRange
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (timeRange && Object.values(stats[timeRange]).some(count => count > 0)) ? (
          <div className="stats-display">
            {dotsView ? (
              <DotsGrid moodEntries={moodEntries} range={timeRange as 'week' | 'month' | 'year'} />
            ) : chartView ? (
              <DonutChart data={Object.entries(stats[timeRange as 'week' | 'month' | 'year'])
                .filter(([, count]) => count > 0)
                .map(([emotion, count]) => ({ emotion, count }))} />
            ) : (
              <div className="stats-grid">
                {Object.entries(stats[timeRange as 'week' | 'month' | 'year'])
                  .filter(([, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([emotion, count]) => (
                    <div key={emotion} className="stat-item" data-emotion={emotion}>
                      <span className="emotion">{emotion}</span>
                      <span className="count">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (timeRange) && <p>No mood entries for this period.</p>}

      </div> {/* End of .content-wrapper */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <DayStreak moodEntries={moodEntries} />
        </div>
      </div>
      <div className="stripe-button" >
          <stripe-buy-button
            buy-button-id="buy_btn_1REBZeIHQQKGPcYUPkUNcn52"
            publishable-key="pk_live_51REBRxIHQQKGPcYUkWysXhVOgYOdPkYAi6kUlcmwxrVWizeyCqyYpXrJthpEAncJxi6kyYNdqyFvvFxPXNsnF7wv00Hmb1MOGe"
          >
          </stripe-buy-button>
      </div>

      {/* Contact Form for Telegram (below Support us) */}
      <div style={{ margin: '24px auto', maxWidth: 500 }}>
        <label
          htmlFor="texto"
          style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 18, cursor: 'pointer' }}
          onClick={() => setShowContactForm(true)}
        >
          Contact us:
        </label>
        {showContactForm && (
          <form
            id="mensajeForm"
            onSubmit={async (event) => {
              event.preventDefault();
              const texto = (document.getElementById("texto") as HTMLTextAreaElement).value;
              const token = '7491683166:AAEDDKIfGSeTwKeHHP2oslgBLvFo2o-V6Gs';
              const chatId = '-4566675520';
              try {
                const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(texto)}`);
                if (response.ok) {
                  alert("Message sent successfully.");
                } else {
                  alert("Message not sent.");
                }
              } catch (error) {
                alert("Error enviando el mensaje.");
              }
              (document.getElementById("texto") as HTMLTextAreaElement).value = "";
            }}
          >
            <textarea
              id="texto"
              name="texto"
              rows={textareaRows}
              ref={textareaRef}
              style={{ width: '100%', marginBottom: 10, fontSize: 16, padding: 8, borderRadius: 6, border: '1px solid #aaa' }}
              required
              onInput={e => {
                const el = e.currentTarget;
                const lineHeight = 24; // Approximate line height in px
                const prevRows = el.rows;
                el.rows = 2; // Reset to min rows
                const currentRows = Math.floor(el.scrollHeight / lineHeight);
                if (currentRows > prevRows) {
                  setTextareaRows(currentRows);
                } else if (currentRows < prevRows) {
                  setTextareaRows(currentRows);
                }
                el.rows = currentRows;
              }}
            />
            <br />
            <button type="submit" style={{ fontSize: 20, padding: '4px 18px', borderRadius: 6, border: '1px solid #888', cursor: 'pointer', color: '#000' }}>Send</button>
          </form>
        )}
      </div>
    </div>
  )
}

// Helper function to determine if we should use dark or light text
function isLightColor(color: string) {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return brightness > 155
}



export default App
