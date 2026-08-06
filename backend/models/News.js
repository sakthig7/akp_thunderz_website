const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', NewsSchema);
