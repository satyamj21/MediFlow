const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: String, // stored as "YYYY-MM-DD" for easy lookup
    required: true,
  },
  expectedCount: {
    type: Number,
    default: 0,
  },
});

// Compound unique index so one record per doctor per date
dailyReportSchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyReport", dailyReportSchema);
