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

  } else if (range === 'month') {
    const monthData = [];
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed month

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Calculate the day of the week for the 1st of the month (0 for Monday, 6 for Sunday)
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;

    // Add nulls for padding at the beginning of the month to align with weekday (Monday)
    for (let i = 0; i < firstDayWeekday; i++) {
      monthData.push(null);
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);
      monthData.push(date);
    }
    return monthData;

  } else { // 'week' range
    let days = 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() + 6) % 7); // Set to the most recent Monday

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
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
            {monthDays.map((date, i) => {
              const mood = date ? entryMap[date.toDateString()] : null;
              return (
                <div
                  key={date ? date.toISOString() : `empty-${monthIndex}-${i}`}
                  title={date ? date.toDateString() + (mood ? `: ${mood}` : '') : ''}
                  style={{
                    width: dot,
                    height: dot,
                    borderRadius: '50%',
                    background: date ? getColor(mood || null) : 'transparent',
                    border: date ? '1px solid #ccc' : 'none',
                    margin: 0,
                    display: 'inline-block',
                    boxSizing: 'border-box',
                  }}
                />
              );
            })}
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
        {(data as (Date | null)[]).map((date, i) => {
          const mood = date ? entryMap[date.toDateString()] : null;
          return (
            <div
              key={date ? date.toISOString() : `empty-${i}`}
              title={date ? date.toDateString() + (mood ? `: ${mood}` : '') : ''}
              style={{
                width: dot,
                height: dot,
                borderRadius: '50%',
                background: date ? getColor(mood || null) : 'transparent',
                border: date ? '1px solid #ccc' : 'none',
                margin: 0,
                display: 'inline-block',
                boxSizing: 'border-box',
              }}
            />
          );
        })}
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
    if (!timeRange || entries.length === 0) return null;

    // Check for insufficient records
    let expectedRecords = 0;
    if (timeRange === 'week') {
      expectedRecords = 7;
    } else if (timeRange === 'month') {
      const today = new Date();
      expectedRecords = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    }

    const hasInsufficientRecords = timeRange !== 'year' && entries.length < expectedRecords / 2;

    // Get the most frequent emotion
    const emotionCounts = entries.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Get the emotion group for the most frequent emotion
    const getEmotionGroup = (emotion: string) => {
      if (['Happy', 'Excited', 'Grateful', 'Hopeful', 'Proud', 'Motivated', 'Pleasant'].includes(emotion)) {
        return 'positive';
      } else if (['Anxious', 'Stressed', 'Overwhelmed', 'Frustrated', 'Sad', 'Angry', 'Lonely'].includes(emotion)) {
        return 'challenging';
      } else {
        return 'neutral';
      }
    };

    const emotionGroup = mostFrequentEmotion ? getEmotionGroup(mostFrequentEmotion) : null;

    // Get a random template based on the emotion group
    const getRandomTemplate = (group: string) => {
      const templates = {
        positive: positiveTemplates,
        challenging: challengingTemplates,
        neutral: balancedTemplates
      };
      const groupTemplates = templates[group as keyof typeof templates];
      return groupTemplates[Math.floor(Math.random() * groupTemplates.length)];
    };

    // Generate the summary text
    let summaryText = '';
    if (emotionGroup && mostFrequentEmotion) {
      const template = getRandomTemplate(emotionGroup);
      summaryText = `Based on your recent entries, ${template}`;
    }

    // Add note about insufficient records if applicable
    if (hasInsufficientRecords) {
      summaryText += `\n\nNote: You've recorded fewer than half of the expected entries for this ${timeRange}.`;
    }

    return summaryText;
mon  };

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
