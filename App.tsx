import React, { useState, useEffect } from 'react'
import { EMOTIONS, MoodStats, EmotionData } from './types'
import { saveMoodEntry, getMoodEntries, calculateStats } from './utils/moodUtils'
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
    saveMoodEntry(emotion)
    const entries = getMoodEntries()
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
      <div className="header">
        <h1 className="app-title">MyDailyMood</h1>
        <p className="app-tagline">Little check-ins, big self-care.</p>
      </div>
      <div className="date-display">
        {formatDate(currentDate)}
      </div>
      
      <div className="emotion-bubbles">
        {EMOTIONS.map((emotion: EmotionData, index: number) => {
          const layout = BUBBLE_LAYOUTS[index] || BUBBLE_LAYOUTS[0]
          const delay = (index * 0.2) % 2;
          return (
            <button
              key={emotion.name}
              className="emotion-bubble"
              style={{ 
                backgroundColor: emotion.color,
                color: isLightColor(emotion.color) ? '#000' : '#fff',
                left: `${layout.x - 50}px`,
                top: `${layout.y - 50}px`,
                animationDelay: `${delay}s`
              }}
              onClick={() => handleEmotionClick(emotion.name)}
            >
              <span className="emotion-text">{emotion.name}</span>
            </button>
          )
        })}
      </div>

      <div className="content-wrapper">
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
