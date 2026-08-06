const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    nickname: { type: String, trim: true },
    photo: { type: String, default: '' },
    jerseyNumber: { type: Number, required: true, unique: true },
    // Links this roster entry to a registered/authenticated account. Only players
    // with a linked account can be selected in live scoring, and only their stats
    // get auto-updated from match scorecards.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    role: {
      type: String,
      enum: ['Captain', 'Vice Captain', 'Coach', 'Manager', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'],
      required: true
    },
    battingStyle: { type: String, enum: ['Right-Handed', 'Left-Handed', 'N/A'], default: 'N/A' },
    bowlingStyle: { type: String, default: 'N/A' },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      ballsFaced: { type: Number, default: 0 }, // running total, used to recompute strikeRate
      timesOut: { type: Number, default: 0 } // running total, used to recompute average
    },
    awards: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', PlayerSchema);
