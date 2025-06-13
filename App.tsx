import React, { useState, useEffect } from 'react'
import { EMOTIONS } from './constants'
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

  return (
    <div className="streak-container">
      <div className="streak-flame">
        <span className="streak-number">{streak} </span>
        <span className="streak-text">day streak!</span>
        <svg id="streak" transform="translate(1.000000, 1.000000)" fillRule="nonzero">
          <g fill="#FF9600" stroke="#FFFFFF" strokeWidth="2">
            <path d="M0.068,15.675 L0.044,7.216 C0.039,5.334 1.25,3.942 3.056,4.246 C3.413,4.306 3.998,4.491 4.306,4.656 L5.997,5.561 L9.247,1.464 C9.79255754,0.776391272 10.6222536,0.37555895 11.5,0.37555895 C12.3777464,0.37555895 13.2074425,0.776391272 13.753,1.464 L20.523,10 C22.1231469,11.939276 22.9988566,14.3747884 23,16.889 C23,23.034 17.843,28 11.5,28 C5.157,28 0,23.034 0,16.889 C0,16.481 0.023,16.076 0.068,15.675 Z" />
          </g>
          <g transform="translate(7.000000, 11.000000)" fill="#FFC800">
            <path d="M1.012,5.077 C1.02645313,5.04002851 1.04561094,5.00507392 1.069,4.973 L3.719,1.364 C3.89306825,1.12674185 4.1697362,0.986581193 4.464,0.986581193 C4.7582638,0.986581193 5.03493175,1.12674185 5.209,1.364 L7.732,4.8 C8.54117469,5.59477404 8.99791508,6.68079318 9,7.815 C9,10.208 6.985,12.148 4.5,12.148 C2.015,12.148 0,10.208 0,7.815 C0,6.776 0.38,5.823 1.012,5.077 Z" />
          </g>
        </svg>
        
      </div>
      {/* <p className="streak-info">
        A <span className="streak-highlight">streak</span> counts how many days you've practiced in a row
      </p> */}
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
    target.setHours(11, 30, 0, 0); // 11:30 local time
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
  let days = 7;
  if (range === 'month') days = 30;
  if (range === 'year') days = 365;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function DotsGrid({ moodEntries, range }: { moodEntries: MoodEntry[]; range: 'week' | 'month' | 'year' }) {
  const days = getDaysArray(range);
  // Map date string to emotion
  const entryMap = Object.fromEntries(
    moodEntries.map(e => [new Date(e.timestamp).toDateString(), e.emotion])
  );
  // Responsive columns and dot size
  let columns = 7, dot = 16, gap = 4, gridWidth: number | undefined = 180, fullWidth = false;
  if (range === 'year') { columns = 21; dot = 13; gap = 2; gridWidth = undefined; fullWidth = true; }
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
      {days.map((date, i) => (
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

function App() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(getMoodEntries());
  const [stats, setStats] = useState<MoodStats>(calculateStats(moodEntries));
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | null>(null)
  const [chartView, setChartView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dotsView, setDotsView] = useState(false);
  const [showAllMoods, setShowAllMoods] = useState(false);

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

  const handleEmotionClick = (emotion: string) => {
    if (hasEntryForToday(moodEntries)) {
      alert("Mood NOT saved. You've already recorded today's mood — try again tomorrow!")
      return
    }
    saveMoodEntry(emotion)
    const updatedEntries = getMoodEntries();
    setMoodEntries(updatedEntries);
    alert(moodMessages[emotion] || "Thanks for logging your mood for today! Come back tomorrow to log your next one.")
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
  const generateMoodSummary = (entries: MoodEntry[]) => {
    if (entries.length === 0) return "No mood entries yet. Start tracking your moods to get insights!";

    // Group emotions by category
    const emotionCategories = {
      positive: ['Hopeful', 'Confident', 'Cheerful', 'Pleasant', 'Pleased', 'Playful', 'Good', 'Calm', 'Chill'],
      neutral: ['Curious', 'Thoughtful', 'Bored'],
      challenging: ['Tense', 'Uneasy', 'Tired', 'Fatigued']
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
      .map(([emotion, count]) => `${emotion} (${count} times)`);

    // Generate summary text
    let summary = `Based on your ${total} mood entries:\n\n`;
    
    if (positivePercent > 60) {
      summary += "You've been experiencing predominantly positive emotions. ";
    } else if (challengingPercent > 40) {
      summary += "You've had some challenging moments recently. ";
    } else {
      summary += "Your emotional state has been quite balanced. ";
    }

    summary += `Your most frequent emotions were ${topEmotions.join(', ')}.\n\n`;

    if (positivePercent > 70) {
      summary += "You're maintaining a very positive outlook!";
    } else if (challengingPercent > 50) {
      summary += "Remember that challenging emotions are temporary and part of the human experience.";
    } else {
      summary += "You're showing good emotional balance in your daily life.";
    }

    return summary;
  };

  return (
    <div className={`app${isDarkMode ? ' dark-mode' : ''}`}>
      <header className="header">
        <h1 className="app-title">MyDailyMood</h1>
        <p className="app-tagline">Little check-ins, big self-care.</p>
        <p className="date-display">{formatDate(new Date())}</p>
      </header>

      <div className="content-wrapper">
        
        
        <div className="emotion-bubbles">
          {EMOTIONS.map((emotion: string, index: number) => (
            <button
              key={emotion}
              className="emotion-bubble"
              onClick={() => handleEmotionClick(emotion)}
              style={{
                backgroundColor: `var(--${emotion.toLowerCase()}-color)`,
                '--animation-order': index,
              } as React.CSSProperties}
            >
              <span className="emotion-text">{emotion}</span>
            </button>
          ))}
        </div>

        <div className="stats-controls">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange(timeRange === 'week' ? null : 'week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange(timeRange === 'month' ? null : 'month')}
          >
            Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => {setTimeRange(timeRange === 'year' ? null : 'year'); setChartView(false); setDotsView(false); setShowAllMoods(false);}}
          >
            Year
          </button>
          <button
            className={showAllMoods ? 'active' : ''}
            onClick={() => {setShowAllMoods(true); setTimeRange(null); setChartView(false); setDotsView(false);}}
          >
            All Moods
          </button>
        </div>
        {(timeRange || showAllMoods) && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', gap: 8 }}>
            <button
              className="toggle-chart-view"
              onClick={() => { setChartView(false); setDotsView(false); setShowAllMoods(false);}}
              style={{ fontSize: 12, padding: '2px 10px', border: (!chartView && !dotsView && !showAllMoods) ? '2px solid #333' : undefined }}
            >
              List View
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
            <h3>All Available Moods:</h3>
            <ul>
              {EMOTIONS.map((emotion) => (
                <li key={emotion} style={{ color: getColor(emotion) }}>
                  {emotion}
                </li>
              ))}
            </ul>
            <div className="mood-summary">
              <h4>Your Mood Summary</h4>
              <p style={{ whiteSpace: 'pre-line', textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {generateMoodSummary(moodEntries)}
              </p>
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

        <DayStreak moodEntries={moodEntries} />

      </div>
      <div className="stripe-button" >
          <stripe-buy-button
            buy-button-id="buy_btn_1REBZeIHQQKGPcYUPkUNcn52"
            publishable-key="pk_live_51REBRxIHQQKGPcYUkWysXhVOgYOdPkYAi6kUlcmwxrVWizeyCqyYpXrJthpEAncJxi6kyYNdqyFvvFxPXNsnF7wv00Hmb1MOGe"
          >
          </stripe-buy-button>
      </div>
      <Analytics />
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
