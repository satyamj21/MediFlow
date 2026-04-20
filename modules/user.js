const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "receptionist", "doctor"],
    default: "user",
  },

  // ── Patient Profile Fields (optional, backward-compatible) ─────────────
  fullName: { type: String, default: "" },
  phone: { type: String, default: "" },
  emergencyContactName: { type: String, default: "" },
  emergencyContactPhone: { type: String, default: "" },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown", ""],
    default: "",
  },
  allergies: { type: String, default: "" },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", "Prefer not to say", ""],
    default: "",
  },
  age: { type: Number, default: null },
  addedByReceptionist: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);

