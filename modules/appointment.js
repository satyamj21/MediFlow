const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },

  date: {
    type: Date,
    required: true
  },

  timeSlot: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "Pending"
  }

});

module.exports = mongoose.model("Appointment", appointmentSchema);
