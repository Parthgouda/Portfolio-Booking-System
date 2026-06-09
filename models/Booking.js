const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  service: {
    type: String,
    required: true
  },

  budget: String,

  deadline: String,

  description: String,
status: {
  type: String,
  default: "Pending"
}
}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);