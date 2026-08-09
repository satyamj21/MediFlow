
if(process.env.NODE_ENV !="production"){
    require('dotenv').config()
}
const mongoose = require("mongoose");
const Doctor = require("./modules/doctor");

mongoose.connect(process.env.ATLAS_URL);

const doctors = [
  {
    name: "Dr. Sarah",
    specialization: "Cardiologist",
    availableDays: ["Mon", "Sat"],
    availableSlots: ["10:00 AM", "10:00 PM"]
  },
  {
    name: "Dr. Jhatka",
    specialization: "Dermatologist",
    availableDays: ["Tue", "Sun"],
    availableSlots: ["9:00 AM", "11:00 PM"]
  },
  {
    name: "Dr. John Smith",
    specialization: "Orthopedic",
    availableDays: ["Mon", "Fri"],
    availableSlots: ["9:00 AM", "9:00 PM"]
  },
  
];

async function seedDoctors() {

  await Doctor.deleteMany({}); // clears old doctors

  await Doctor.insertMany(doctors);

  console.log("Doctors seeded successfully");

  mongoose.connection.close();
}

seedDoctors();