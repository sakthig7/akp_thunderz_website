const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, required: true },
    occupation: { type: String },
    cricketRole: { type: String, required: true },
    experience: { type: String },
    photo: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', RegistrationSchema);
