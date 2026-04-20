const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["skipped", "reschedule_proposed", "token_updated"],
    required: true,
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: "Appointment",
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  // Reschedule proposal details (populated when type === 'reschedule_proposed')
  proposedDate: {
    type: Date,
    default: null,
  },
  proposedTimeSlot: {
    type: String,
    default: null,
  },
  proposedDoctor: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
    default: null,
  },
  // Original values (so patient can see what changed)
  originalDate: {
    type: Date,
    default: null,
  },
  originalTimeSlot: {
    type: String,
    default: null,
  },
  doctorName: {
    type: String,
    default: null,
  },
  proposedDoctorName: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
