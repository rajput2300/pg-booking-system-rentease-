const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 6 },
  phone:        { type: String, trim: true },
  role:         { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  businessName: { type: String, trim: true },
  ownerApproved:{ type: Boolean, default: false },
  avatar:       { type: String, default: '' },
  wishlist:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'PG' }]
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
