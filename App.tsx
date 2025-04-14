import React, { useState, useEffect } from 'react'
import { EMOTIONS, MoodStats, EmotionData } from './types'
import { saveMoodEntry, getMoodEntries, calculateStats } from './utils/moodUtils'
import './App.css'

// Define bubble positions in color-grouped patterns
const BUBBLE_LAYOUTS = [
  // Reds/Oranges (top)
  { x: 300, y: 200 },  // Hopeful
  { x: 380, y: 180 },  // Confident
  { x: 280, y: 260 },  // Tense
  { x: 360, y: 260 },  // Uneasy

  // Yellows (top-right)
  { x: 460, y: 180 },  // Cheerful
  { x: 500, y: 240 },  // Curious
  { x: 440, y: 300 },  // Pleasant
  { x: 380, y: 320 },  // Pleased
  { x: 460, y: 360 },  // Playful

  // Blues (bottom-left)
  { x: 280, y: 380 },  // Bored
  { x: 240, y: 320 },  // Tired
  { x: 320, y: 440 },  // Fatigued

  // Greens (bottom-right)
  { x: 420, y: 420 },  // Calm
  { x: 500, y: 440 },  // Good
  { x: 440, y: 480 },  // Thoughtful
  { x: 380, y: 440 }   // Chill
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
