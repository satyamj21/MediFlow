const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const queueEntrySchema = new Schema({
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  patientName: {
    type: String,
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: String,
    required: true // YYYY-MM-DD
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'served', 'skipped'],
    default: 'waiting'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("QueueEntry", queueEntrySchema);
