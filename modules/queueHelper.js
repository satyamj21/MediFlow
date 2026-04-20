const QueueEntry = require("./queueEntry");
const Notification = require("./notification");

const MINS_PER_PATIENT = 10;

/**
 * Parse a timeSlot string like "9:00 AM" or "12:30 PM" into total minutes since midnight.
 */
function parseTimeSlotToMinutes(timeSlot) {
  if (!timeSlot) return 0;
  const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Assign or reassign a token for an appointment in the queue.
 * Handles insertion in chronological order and renumbers affected waiting tokens.
 *
 * @param {Object} opts
 * @param {ObjectId} opts.doctorId
 * @param {string}   opts.dateStr       - "YYYY-MM-DD"
 * @param {string}   opts.newTimeSlot   - "H:MM AM/PM"
 * @param {ObjectId|null} opts.patientId
 * @param {string}   opts.patientName
 * @param {ObjectId} opts.appointmentId
 * @param {ObjectId|null} opts.existingEntryId - If reassigning, the entry to replace
 * @returns {Promise<QueueEntry>} - The newly created/updated QueueEntry
 */
async function assignToken({ doctorId, dateStr, newTimeSlot, patientId, patientName, appointmentId, existingEntryId }) {

  // Step 1: Remove old entry if reassigning
  if (existingEntryId) {
    const oldEntry = await QueueEntry.findById(existingEntryId);
    if (oldEntry && oldEntry.status === "waiting") {
      const removedToken = oldEntry.tokenNumber;
      const oldDoctorId = oldEntry.doctor;
      const oldDate = oldEntry.date;
      await QueueEntry.findByIdAndDelete(existingEntryId);
      // Close the gap left by removal: decrement tokens above the removed position
      await QueueEntry.updateMany(
        { doctor: oldDoctorId, date: oldDate, status: "waiting", tokenNumber: { $gt: removedToken } },
        { $inc: { tokenNumber: -1 } }
      );
      // Notify affected patients about their shifted tokens (on the OLD doctor+date)
      await notifyShiftedPatients(oldDoctorId, oldDate);
    }
    // If entry is called/served/skipped — do not delete it, just create new entry
  }

  // Step 2: Get all current waiting entries for this doctor+date, sorted by tokenNumber
  const currentWaiting = await QueueEntry.find({
    doctor: doctorId,
    date: dateStr,
    status: "waiting"
  }).populate("appointment").sort({ tokenNumber: 1 });

  // Step 3: Determine insertion position based on timeSlot
  // Walk-in entries (no appointment) are ignored for position calculation — they stay at end
  const newMinutes = parseTimeSlotToMinutes(newTimeSlot);
  let insertPosition = 1;

  for (const entry of currentWaiting) {
    const entrySlot = entry.appointment ? entry.appointment.timeSlot : null;
    if (entrySlot) {
      const entryMinutes = parseTimeSlotToMinutes(entrySlot);
      if (entryMinutes <= newMinutes) {
        insertPosition = entry.tokenNumber + 1;
      }
    } else {
      // Walk-in entry (no appointment timeSlot) — new appointment always goes before walk-ins
      // Don't advance insertPosition past walk-ins
    }
  }

  // Step 4: Make room — increment tokenNumber for all waiting entries at or above insertPosition
  await QueueEntry.updateMany(
    { doctor: doctorId, date: dateStr, status: "waiting", tokenNumber: { $gte: insertPosition } },
    { $inc: { tokenNumber: 1 } }
  );

  // Step 5: Create the new QueueEntry at the correct position
  const newEntry = new QueueEntry({
    appointment: appointmentId,
    patient: patientId,
    patientName,
    doctor: doctorId,
    date: dateStr,
    tokenNumber: insertPosition,
    status: "waiting",
    checkedInPhysically: false
  });
  await newEntry.save();

  // Step 6: Notify affected patients about shifted tokens (on the NEW doctor+date)
  await notifyShiftedPatients(doctorId, dateStr);

  return newEntry;
}

/**
 * Notify patients whose tokens were shifted.
 * Only sends notifications to patients who haven't physically arrived yet.
 */
async function notifyShiftedPatients(doctorId, dateStr) {
  try {
    const Doctor = require("./doctor");
    const entries = await QueueEntry.find({
      doctor: doctorId,
      date: dateStr,
      status: "waiting",
      patient: { $ne: null },
      checkedInPhysically: false
    }).populate("appointment").populate("doctor");

    for (const entry of entries) {
      const doctorName = entry.doctor ? entry.doctor.name : "your doctor";
      const timeSlot = entry.appointment ? entry.appointment.timeSlot : "";

      // Check if we already sent a notification for this exact token number
      const existingNotif = await Notification.findOne({
        user: entry.patient,
        type: "token_updated",
        appointment: entry.appointment ? entry.appointment._id : null,
        message: new RegExp(`#${entry.tokenNumber}`)
      });

      if (!existingNotif) {
        await Notification.create({
          user: entry.patient,
          type: "token_updated",
          appointment: entry.appointment ? entry.appointment._id : null,
          message: `Your queue token has been updated to #${entry.tokenNumber} for your ${timeSlot} appointment with ${doctorName}.`,
        });
      }
    }
  } catch (err) {
    console.error("Error sending token shift notifications:", err);
  }
}

/**
 * Remove a queue entry for a cancelled appointment and renumber tokens.
 *
 * @param {ObjectId} appointmentId
 * @returns {Promise<void>}
 */
async function removeTokenForAppointment(appointmentId) {
  const entry = await QueueEntry.findOne({ appointment: appointmentId, status: "waiting" });
  if (!entry) return;

  const { doctor, date, tokenNumber } = entry;
  await QueueEntry.findByIdAndDelete(entry._id);

  // Close the gap: decrement tokens above the removed position
  await QueueEntry.updateMany(
    { doctor, date, status: "waiting", tokenNumber: { $gt: tokenNumber } },
    { $inc: { tokenNumber: -1 } }
  );

  // Notify affected patients
  await notifyShiftedPatients(doctor, date);
}

module.exports = { assignToken, parseTimeSlotToMinutes, removeTokenForAppointment, MINS_PER_PATIENT };
