const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user:{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true 
    },
  pg: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PG', 
    required: true 
    },
  checkIn: {
     type: Date, 
     required: true 
    },
  checkOut: {
     type: Date 
    },
  duration: { 
    type: Number, 
    default: 1 
  },  // months
  totalAmount: {
     type: Number, 
     required: true 
    },
  status: {
     type: String, 
     enum: ['pending', 'approved', 'rejected', 'cancelled'], 
     default: 'pending' 
    },
  paymentStatus: {
     type: String, 
     enum: ['unpaid', 'paid', 'refunded'], 
     default: 'unpaid' 
    },
  message: {
     type: String, 
     trim: true 
    },
  adminNote: {
     type: String, 
     trim: true 
    }
},
 
{ timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
