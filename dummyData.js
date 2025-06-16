// Generate dummy mood data
const emotions = [
  'Hopeful', 'Confident', 'Cheerful', 'Pleasant', 'Pleased', 'Playful',
  'Good', 'Calm', 'Chill', 'Curious', 'Thoughtful', 'Bored',
  'Tired', 'Fatigued', 'Tense', 'Uneasy'
];

// Function to get a random emotion
const getRandomEmotion = () => emotions[Math.floor(Math.random() * emotions.length)];

// Function to create a mood entry
const createMoodEntry = (timestamp) => ({
  id: crypto.randomUUID(),
  emotion: getRandomEmotion(),
  timestamp
});

// Generate entries for the last 30 days
const entries = [];

// Get current date
const now = new Date();
now.setHours(12, 0, 0, 0); // Set to noon for consistency

// Generate entries for the last 30 days
for (let i = 0; i < 30; i++) {
  const date = new Date(now);
  date.setDate(date.getDate() - i);
  
  // Skip some random days to make it more realistic
  if (Math.random() > 0.3) { // 70% chance of having an entry
    entries.push(createMoodEntry(date.getTime()));
  }
}

// Ensure we have exactly 18 entries in the past month
while (entries.length < 18) {
  const randomDay = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(date.getDate() - randomDay);
  entries.push(createMoodEntry(date.getTime()));
}

// Ensure we have a 7-day streak
const streakStart = new Date(now);
streakStart.setDate(streakStart.getDate() - 6); // Start 6 days ago

for (let i = 0; i < 7; i++) {
  const date = new Date(streakStart);
  date.setDate(date.getDate() + i);
  const entryExists = entries.some(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.toDateString() === date.toDateString();
  });
  
  if (!entryExists) {
    entries.push(createMoodEntry(date.getTime()));
  }
}

// Save to localStorage
localStorage.setItem('mood-tracker-entries', JSON.stringify(entries));

console.log('Dummy data generated and saved to localStorage');
console.log('Total entries:', entries.length);
console.log('Entries:', entries); 