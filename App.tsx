import React, { useState, useEffect } from 'react'
import { EMOTIONS, MoodStats, EmotionData } from './types'
import { saveMoodEntry, getMoodEntries, calculateStats, hasEntryForToday } from './utils/moodUtils'
import './App.css'

// Define bubble positions in color-grouped patterns
const BUBBLE_LAYOUTS = [
  // Reds/Oranges (top)
  { x: 180, y: 60 },    // Hopeful
  { x: 260, y: 50 },    // Confident
  { x: 100, y: 80 },    // Tense
  { x: 180, y: 120 },   // Uneasy

  // Yellows (top-right)
  { x: 300, y: 90 },    // Cheerful
  { x: 340, y: 160 },   // Curious
  { x: 280, y: 200 },   // Pleasant
  { x: 220, y: 160 },   // Pleased
  { x: 300, y: 240 },   // Playful

  // Blues (bottom-left)
  { x: 80, y: 240 },    // Bored
  { x: 40, y: 160 },    // Tired
  { x: 120, y: 320 },   // Fatigued

  // Greens (bottom-right)
  { x: 220, y: 320 },   // Calm
  { x: 300, y: 340 },   // Good
  { x: 180, y: 340 },   // Thoughtful
  { x: 120, y: 280 }    // Chill
]

function App() {
  const [stats, setStats] = useState<MoodStats>({ week: {}, month: {}, year: {} })
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const entries = getMoodEntries()
    setStats(calculateStats(entries))

    // Update date every minute
    const dateInterval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => {
      clearInterval(dateInterval)
    }
  }, [])

  const handleEmotionClick = (emotion: string) => {
    const entries = getMoodEntries()
    
    if (hasEntryForToday(entries)) {
      alert("You've already recorded your mood for today. Come back tomorrow to log your next one")
      return
    }

    const newEntry = {
      emotion,
      timestamp: new Date().toISOString(),
    }

    saveMoodEntry(emotion)
    setStats(calculateStats(entries))
  }

  const getSortedEmotions = () => {
    if (!selectedPeriod) return []
    
    return EMOTIONS
      .map(emotion => ({
        ...emotion,
        count: stats[selectedPeriod][emotion.name] || 0
      }))
      .filter(emotion => emotion.count > 0)
      .sort((a, b) => b.count - a.count)
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
        <p className="date">{formatDate(new Date())}</p>
      </header>
      <div className="content-wrapper">
        <div className="emotion-bubbles">
          {EMOTIONS.map((emotion, index) => (
            <button
              key={emotion}
              className="emotion-bubble"
              style={{
                '--animation-order': index,
                backgroundColor: getEmotionColor(emotion),
                left: `${BUBBLE_LAYOUTS[index].x}px`,
                top: `${BUBBLE_LAYOUTS[index].y}px`,
              } as React.CSSProperties}
              onClick={() => handleEmotionClick(emotion)}
            >
              {emotion}
            </button>
          ))}
        </div>
        <div className="stats-display">
          <div className="stats-controls">
            <button
              className={selectedPeriod === 'week' ? 'active' : ''}
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </button>
            <button
              className={selectedPeriod === 'month' ? 'active' : ''}
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </button>
            <button
              className={selectedPeriod === 'year' ? 'active' : ''}
              onClick={() => setSelectedPeriod('year')}
            >
              Year
            </button>
          </div>

          {selectedPeriod && (
            <div className="stats-display">
              <h2>Statistics for the {selectedPeriod}</h2>
              <div className="stats-grid">
                {getSortedEmotions().map(({ name, color, count }) => (
                  <div 
                    key={name} 
                    className="stat-item"
                    data-emotion={name}
                  >
                    <span className="emotion">{name}</span>
                    <span className="count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
