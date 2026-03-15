const mongoose = require("mongoose");
const Doctor = require("./modules/doctor");

mongoose.connect("mongodb://127.0.0.1:27017/mediflow");

const doctors = [
  {
    name: "Dr Sarah Khan",
    specialization: "Cardiologist",
    availableDays: ["Mon", "Tue", "Wed"],
    availableSlots: ["10:00", "11:00", "12:00"]
  },
  {
    name: "Dr Jhatka",
    specialization: "Dermatologist",
    availableDays: ["Tue", "Thu"],
    availableSlots: ["9:00", "10:00", "11:00"]
  },
  {
    name: "Dr John Smith",
    specialization: "Orthopedic",
    availableDays: ["Mon", "Wed", "Fri"],
    availableSlots: ["1:00", "2:00", "3:00"]
  }
];

async function seedDoctors() {

  await Doctor.deleteMany({}); // clears old doctors

  await Doctor.insertMany(doctors);

  console.log("Doctors seeded successfully");

  mongoose.connection.close();
}

seedDoctors();