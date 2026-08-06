const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Gallery = require('../models/Gallery');
const News = require('../models/News');
const Registration = require('../models/Registration');
const Contact = require('../models/Contact');

// @desc    Aggregated stats for the admin dashboard
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [
    totalPlayers,
    totalUsers,
    upcomingMatches,
    completedMatches,
    galleryCount,
    newsCount,
    pendingRegistrations,
    totalRegistrations,
    unreadContacts
  ] = await Promise.all([
    Player.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Match.countDocuments({ status: 'Upcoming' }),
    Match.countDocuments({ status: 'Completed' }),
    Gallery.countDocuments(),
    News.countDocuments(),
    Registration.countDocuments({ status: 'Pending' }),
    Registration.countDocuments(),
    Contact.countDocuments({ isRead: false })
  ]);

  const recentRegistrations = await Registration.find().sort({ createdAt: -1 }).limit(5).select('name status createdAt');
  const recentMatches = await Match.find().sort({ date: -1 }).limit(5);
  const recentNews = await News.find().sort({ createdAt: -1 }).limit(5).select('title createdAt');

  res.status(200).json({
    success: true,
    data: {
      totalPlayers,
      totalUsers,
      upcomingMatches,
      completedMatches,
      galleryCount,
      newsCount,
      pendingRegistrations,
      totalRegistrations,
      unreadContacts,
      recentActivity: {
        registrations: recentRegistrations,
        matches: recentMatches,
        news: recentNews
      }
    }
  });
});
