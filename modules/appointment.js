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
  },

  // ── Pending Reschedule Proposal (set by receptionist, confirmed/declined by patient) ──
  reschedulePending: {
    type: Boolean,
    default: false
  },
  proposedDate: {
    type: Date,
    default: null
  },
  proposedTimeSlot: {
    type: String,
    default: null
  },
  proposedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null
  }

});

module.exports = mongoose.model("Appointment", appointmentSchema);
