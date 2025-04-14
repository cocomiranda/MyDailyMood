import React, { useState, useEffect, useRef } from 'react'
import { EMOTIONS } from './constants'
import { MoodStats } from './types'
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
] as const

interface BubblePosition {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const INITIAL_SPEED = 0.3;

const createBubblePosition = (): BubblePosition => {
  const speed = Math.random() * 0.2 + INITIAL_SPEED;
  return {
    x: Math.random() * 300,
    y: Math.random() * 300,
    dx: (Math.random() < 0.5 ? -1 : 1) * speed,
    dy: (Math.random() < 0.5 ? -1 : 1) * speed
  };
};

function App() {
  const [stats, setStats] = useState<MoodStats>({ week: {}, month: {}, year: {} })
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const containerRef = useRef<HTMLDivElement>(null)
  const [bubblePositions, setBubblePositions] = useState<{ [key: string]: BubblePosition }>(
    Object.fromEntries(EMOTIONS.map((emotion: string) => [emotion, createBubblePosition()]))
  )

  useEffect(() => {
    const entries = getMoodEntries()
    setStats(calculateStats(entries))
  }, [])

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    const bubbleSize = 52; // size of emotion bubbles

    const animationId = requestAnimationFrame(function animate() {
      setBubblePositions(prevPositions => {
        const newPositions = { ...prevPositions };
        
        Object.entries(prevPositions).forEach(([emotion, pos]) => {
          let { x, y, dx, dy } = pos;

          // Bounce off walls
          if (x <= 0 || x + bubbleSize >= width) {
            dx = -dx;
          }
          if (y <= 0 || y + bubbleSize >= height) {
            dy = -dy;
          }

          // Update position
          x += dx;
          y += dy;

          newPositions[emotion] = { x, y, dx, dy };
        });

        return newPositions;
      });

      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationId);
  }, []);

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
        <div className="emotion-bubbles" ref={containerRef}>
          {EMOTIONS.map((emotion: string) => (
            <button
              key={emotion}
              className="emotion-bubble"
              onClick={() => handleEmotionClick(emotion)}
              style={{
                backgroundColor: `var(--${emotion.toLowerCase()}-color)`,
                left: `${bubblePositions[emotion]?.x}px`,
                top: `${bubblePositions[emotion]?.y}px`,
              }}
            >
              <span className="emotion-text">{emotion}</span>
            </button>
          ))}
          <div className="stats-controls">
            <button
              className={timeRange === 'week' ? 'active' : ''}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button
              className={timeRange === 'month' ? 'active' : ''}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button
              className={timeRange === 'year' ? 'active' : ''}
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </div>
        </div>

        <div className="stats-display">
          <div className="stats-grid">
            {Object.entries(stats[timeRange]).map(([emotion, count]) => (
              <div key={emotion} className="stat-item" data-emotion={emotion}>
                <span className="emotion">{emotion}</span>
                <span className="count">{count}</span>
              </div>
            ))}
          </div>
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
