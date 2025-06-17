// Generate dummy mood data for a full year and save to localStorage
const emotions = [
  'Hopeful', 'Confident', 'Cheerful', 'Pleasant', 'Pleased', 'Playful',
  'Good', 'Calm', 'Chill', 'Curious', 'Thoughtful', 'Bored',
  'Tired', 'Fatigued', 'Tense', 'Uneasy', 'Grateful', 'Inspired',
  'Anxious', 'Motivated', 'Lonely', 'Excited', 'Content'
];

// Function to get a random emotion
const getRandomEmotion = () => emotions[Math.floor(Math.random() * emotions.length)];

// Function to create a mood entry
const createMoodEntry = (timestamp) => ({
  id: crypto.randomUUID(),
  emotion: getRandomEmotion(),
  timestamp
});

// Generate entries for the last 365 days
const entries = [];

// Get current date
const now = new Date();
now.setHours(12, 0, 0, 0); // Set to noon for consistency

// Generate entries for the last 365 days
for (let i = 0; i < 365; i++) {
  const date = new Date(now);
  date.setDate(date.getDate() - i);
  
  // 70% chance of having an entry for more realistic data
  if (Math.random() > 0.3) {
    entries.push(createMoodEntry(date.getTime()));
  }
}

// Ensure a 9-day streak of positive emotions
const streakEmotion = 'Hopeful'; // A positive emotion for the streak
const streakStartDate = new Date(now);
streakStartDate.setDate(now.getDate() - 9); // Start 9 days ago to ensure it falls within the last year

for (let i = 0; i < 9; i++) {
  const date = new Date(streakStartDate);
  date.setDate(streakStartDate.getDate() + i);
  
  // Check if an entry already exists for this date, to avoid duplicates
  const entryExists = entries.some(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.toDateString() === date.toDateString();
  });
  
  if (!entryExists) {
    entries.push({
      id: crypto.randomUUID(),
      emotion: streakEmotion,
      timestamp: date.getTime()
    });
  }
}

// Add a 5-day streak for this month
const fiveDayStreakEmotion = 'Confident'; // Example emotion for the 5-day streak
const fiveDayStreakStartDate = new Date(now);
fiveDayStreakStartDate.setDate(now.getDate() - 5); // Start 5 days ago

for (let i = 0; i < 5; i++) {
  const date = new Date(fiveDayStreakStartDate);
  date.setDate(fiveDayStreakStartDate.getDate() + i);
  
  // Check if an entry already exists for this date, to avoid duplicates
  const entryExists = entries.some(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.toDateString() === date.toDateString();
  });
  
  if (!entryExists) {
    entries.push({
      id: crypto.randomUUID(),
      emotion: fiveDayStreakEmotion,
      timestamp: date.getTime()
    });
  }
}

// Ensure the same emotion is added for two Thursdays
const thursdayEmotion = 'Cheerful'; // Example emotion for Thursdays
const thursdayDates = [];

// Find two Thursdays in the last month
for (let i = 0; i < 30; i++) {
  const date = new Date(now);
  date.setDate(now.getDate() - i);
  if (date.getDay() === 4) { // 4 represents Thursday
    thursdayDates.push(date);
    if (thursdayDates.length === 2) break;
  }
}

// Add the same emotion for the two Thursdays
thursdayDates.forEach(date => {
  const entryExists = entries.some(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.toDateString() === date.toDateString();
  });
  
  if (!entryExists) {
    entries.push({
      id: crypto.randomUUID(),
      emotion: thursdayEmotion,
      timestamp: date.getTime()
    });
  }
});

// Save to localStorage
localStorage.setItem('mood-tracker-entries', JSON.stringify(entries));

console.log('Yearly dummy data generated and saved to localStorage');
console.log('Total entries:', entries.length);
// console.log('Entries:', entries); // Uncomment this line if you want to see all entries in the console 