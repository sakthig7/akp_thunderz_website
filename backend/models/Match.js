const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema(
  {
    opponent: { type: String, required: true, trim: true },
    matchType: { type: String, enum: ['T20', 'ODI', 'Test', 'Friendly', 'Tournament'], default: 'T20' },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['Upcoming', 'Live', 'Completed', 'Cancelled'], default: 'Upcoming' },
    liveScore: {
      text: { type: String, default: '' }, // auto-generated headline, e.g. "AKP THUNDERz 145/4 (18.2 ov)"
      updatedAt: { type: Date }
    },
    // Full ball-by-ball scoring state, owned/computed by the admin scoring UI and
    // pushed as one snapshot per ball. Flexible shape (innings array with striker/
    // non-striker/bowler, batting & bowling cards, recent balls, extras, etc.)
    // — see backend/README.md "Live Scoring" section for the exact shape.
    liveMatchData: { type: mongoose.Schema.Types.Mixed, default: null },
    // Guards against double-crediting player stats if a completed match is re-saved
    statsApplied: { type: Boolean, default: false },
    result: {
      winner: { type: String, default: '' },
      score: { type: String, default: '' },
      manOfTheMatch: { type: String, default: '' },
      summary: { type: String, default: '' },
      scoreboard: [
        {
          playerName: String,
          runs: Number,
          balls: Number,
          wickets: Number,
          overs: Number
        }
      ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', MatchSchema);
