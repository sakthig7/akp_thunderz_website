const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    type: { type: String, enum: ['photo', 'video'], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', GallerySchema);
