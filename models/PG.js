const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  title:{
     type: String,
     required: true, 
     trim: true 
    },
  description: { 
    type: String, 
    required: true, 
    trim: true 
  },
  location: {
     type: String, 
     required: true, 
     trim: true 
    },
  city: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: {
     type: String, 
     required: true, 
     trim: true 
    },
  price: {
     type: Number, 
     required: true, 
     min: 1 
    },
  priceType:  {
     type: String, 
     enum: ['monthly', 'daily'], 
     default: 'monthly' 
    },
  gender:  {
     type: String, 
     enum: ['male', 'female', 'co-ed'], 
     required: true 
    },
  totalRooms: {
     type: Number, 
     default: 1, 
     min: 1 
    },
  availableRooms: {
     type: Number, 
     default: 1, 
     min: 0 
    },
    geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  amenities:   [{ type: String }],
  images:      [{ type: String }],
  owner:       { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true },
  featured:    {
     type: Boolean, 
     default: false },
  status:      {
     type: String, 
     enum: ['active', 'inactive', 'pending_approval'], 
     default: 'pending_approval' 
    },
  rating: {
     type: Number, 
     default: 0,
    min: 0, 
    max: 5 
  },
  reviewCount: {
     type: Number, 
     default: 0 
    },
  rules:       [{ type: String }]
}, { timestamps: true });

pgSchema.index({ city: 1, price: 1, gender: 1 });
pgSchema.index({ status: 1, featured: 1 });

module.exports = mongoose.model('PG', pgSchema);
