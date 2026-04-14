const mongoose = require("mongoose");

// Single‑document collection – only ever one record exists
const emergencySchema = new mongoose.Schema({
  active: { type: Boolean, default: false },
  triggeredAt: { type: Date, default: null },
  message: { type: String, default: "Emergency Alert! Please follow staff instructions." },
});

module.exports = mongoose.model("Emergency", emergencySchema);
