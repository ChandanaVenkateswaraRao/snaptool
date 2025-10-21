const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  vendorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  phoneNumber: { type: String, trim: true, default: '' },
  profilePicture: { /* ... */ },
  
  // --- UPDATED LOCATION TO A SIMPLE STRING ---
  city: { type: String, required: true, trim: true },

  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  averageRating: { type: Number, default: 0 },
}, { timestamps: true });

// Add 2dsphere index for location-based queries
userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);