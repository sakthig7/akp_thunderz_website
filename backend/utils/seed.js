// Run with: npm run seed
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Player = require('../models/Player');
const Match = require('../models/Match');
const News = require('../models/News');

const seed = async () => {
  await connectDB();

  // 1. Admin bootstrap
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@akpthunderz.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin'
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  // 2. Sample players
  const playerCount = await Player.countDocuments();
  if (playerCount === 0) {
    await Player.insertMany([
      {
        fullName: 'Arjun Kapoor',
        nickname: 'AK',
        jerseyNumber: 7,
        role: 'Captain',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-arm medium',
        stats: { matchesPlayed: 42, runs: 1580, wickets: 12, strikeRate: 138.5, average: 44.2 },
        awards: ['Best Batsman 2024']
      },
      {
        fullName: 'Vikram Singh',
        nickname: 'Vicky',
        jerseyNumber: 11,
        role: 'Vice Captain',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Left-arm spin',
        stats: { matchesPlayed: 38, runs: 990, wickets: 45, strikeRate: 121.3, average: 29.8 },
        awards: ['Best Bowler 2023']
      },
      {
        fullName: 'Rohan Mehta',
        nickname: 'Ro',
        jerseyNumber: 23,
        role: 'All-Rounder',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-arm fast',
        stats: { matchesPlayed: 30, runs: 620, wickets: 28, strikeRate: 115.0, average: 24.5 },
        awards: []
      }
    ]);
    console.log('Sample players seeded.');
  }

  // 3. Sample matches
  const matchCount = await Match.countDocuments();
  if (matchCount === 0) {
    const now = new Date();
    await Match.insertMany([
      {
        opponent: 'Royal Strikers CC',
        matchType: 'T20',
        venue: 'AKP Ground, Home Turf',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        time: '15:00',
        status: 'Upcoming'
      },
      {
        opponent: 'Falcons Cricket Club',
        matchType: 'T20',
        venue: 'Falcons Stadium',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        time: '14:00',
        status: 'Completed',
        result: {
          winner: 'AKP THUNDERz',
          score: 'AKP THUNDERz 187/6 vs Falcons CC 165/9',
          manOfTheMatch: 'Arjun Kapoor',
          summary: 'AKP THUNDERz won by 22 runs in a thrilling contest.'
        }
      }
    ]);
    console.log('Sample matches seeded.');
  }

  // 4. Sample news
  const newsCount = await News.countDocuments();
  if (newsCount === 0) {
    const admin = await User.findOne({ role: 'admin' });
    await News.create({
      title: 'AKP THUNDERz wins season opener!',
      content: 'The team kicked off the season with a commanding win against Falcons Cricket Club, setting the tone for an exciting year ahead.',
      author: admin ? admin._id : undefined
    });
    console.log('Sample news seeded.');
  }

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
