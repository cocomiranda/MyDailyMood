// Generate dummy mood data for a full year
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

console.log('Yearly dummy data generated (not saved to localStorage).');
console.log('Total entries:', entries.length);
// console.log('Entries:', entries); // Uncomment this line if you want to see all entries in the console 