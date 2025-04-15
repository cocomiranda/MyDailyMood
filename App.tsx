import React, { useState, useEffect } from 'react'
import { EMOTIONS } from './constants'
import { MoodStats, MoodEntry } from './types'
import { saveMoodEntry, getMoodEntries, calculateStats, hasEntryForToday } from './utils/moodUtils'
import './App.css'

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

function App() {
  const [stats, setStats] = useState<MoodStats>({ week: {}, month: {}, year: {} })
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | null>(null)

  useEffect(() => {
    const entries = getMoodEntries()
    setStats(calculateStats(entries))
  }, [])

  const handleEmotionClick = (emotion: string) => {
    const entries = getMoodEntries()
    
    if (hasEntryForToday(entries)) {
      alert("Mood NOT saved. You've already recorded today's mood — try again tomorrow!")
      return
    }

    const newEntry = {
      emotion,
      timestamp: new Date().toISOString(),
    }

    saveMoodEntry(emotion)
    setStats(calculateStats(entries))
    alert("Thanks for logging your mood for today! Come back tomorrow to log your next one.")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="app">
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
            onClick={() => setTimeRange(timeRange === 'year' ? null : 'year')}
          >
            Year
          </button>
        </div>

        {timeRange && Object.values(stats[timeRange]).some(count => count > 0) && (
          <div className="stats-display">
            <div className="stats-grid">
              {Object.entries(stats[timeRange])
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([emotion, count]) => (
                  <div key={emotion} className="stat-item" data-emotion={emotion}>
                    <span className="emotion">{emotion}</span>
                    <span className="count">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <DayStreak moodEntries={getMoodEntries()} />

        <button className="share-button" style={{ marginTop: '0.5rem', display: 'none' }}>
        <a 
          href="https://twitter.com/share?ref_src=twsrc%5Etfw" 
          className="twitter-share-button" 
          data-size="large" 
          data-text="Today I'm feeling happy." 
          data-url="https://mydailymood.vercel.app/" 
          data-hashtags="MentalHealth,SelfCare,MoodTracker,MyDailyMood" 
          data-show-count="false"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginTop: '10rem', display: 'inline-block', textDecoration: 'none', color: 'black' }} // Optional styling
        >
          Tweet
        </a>
        </button>
        <script async src="https://platform.twitter.com/widgets.js" charSet="UTF-8"></script>

        <div style={{ marginTop: '6rem', zoom: '0.6'}}>
          <script async src="https://js.stripe.com/v3/buy-button.js"></script>
          <stripe-buy-button
            buy-button-id="buy_btn_1REBZeIHQQKGPcYUPkUNcn52"
            publishable-key="pk_live_51REBRxIHQQKGPcYUkWysXhVOgYOdPkYAi6kUlcmwxrVWizeyCqyYpXrJthpEAncJxi6kyYNdqyFvvFxPXNsnF7wv00Hmb1MOGe"
          ></stripe-buy-button>
        </div>
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
