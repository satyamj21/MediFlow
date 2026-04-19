const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsmate = require("ejs-mate");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const User = require("./modules/user");
const Doctor = require("./modules/doctor");
const Appointment = require("./modules/appointment");
const DailyReport = require("./modules/dailyReport");
const Emergency = require("./modules/emergency");
const QueueEntry = require("./modules/queueEntry");
const Notification = require("./modules/notification");
const flash = require("connect-flash");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ── MongoDB ────────────────────────────────────────────────
main()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(`MongoDB error: ${err}`));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/mediflow");
}

// ── Session & Passport ────────────────────────────────────
const sessionOptions = {
  secret: "sdfdf",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ── Icon helper – available in every EJS template ────────
app.locals.icon = function(name) {
  const i = {
    hospital:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    dashboard:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
    calendar:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    appointments: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`,
    queue:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    addpatient:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>`,
    report:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>`,
    logout:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    check:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    x:            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    edit:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    doctor:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    clock:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    inbox:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
    success:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    warning:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    phone:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    plus:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    back:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
    search:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    emergency:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    patients:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    profile:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    stethoscope:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  };
  return i[name] || "";
};

// ── Custom helpers ──────────────────────────────────────────
app.locals.isLate = function(appt) {
  if (!appt || appt.status === 'Cancelled' || appt.status === 'Completed') return false;
  try {
    const d = new Date(appt.date);
    if (isNaN(d.getTime())) return false;
    if (!appt.timeSlot) return false;

    const timeMatch = appt.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return false;
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    d.setHours(hours, minutes, 0, 0);

    return new Date() > d;
  } catch (e) {
    return false;
  }
};

// ── Locals middleware ─────────────────────────────────────
app.use((req, res, next) => {
  res.locals.success  = req.flash("success");
  res.locals.error    = req.flash("error");
  res.locals.curruser = req.user;
  next();
});

// ── Passport strategy ─────────────────────────────────────
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ── Auth middleware ───────────────────────────────────────
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");
  next();
}

function isReceptionist(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");
  if (req.user.role !== "receptionist") return res.redirect("/home");
  next();
}

// ════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ════════════════════════════════════════════════════════════

app.get("/", (req, res) => res.redirect("/home"));

app.get("/home", (req, res) => {
  res.render("trial/home");
});

// ── Signup ────────────────────────────────────────────────
app.get("/signup", (req, res) => {
  res.render("trial/signup");
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const passRegex = /^(?=.*[A-Z])(?=.*[@#%\^&\*\(\)!]).{9,}$/;
    if (!passRegex.test(password)) {
      req.flash("error", "Password must be >8 characters, with at least 1 uppercase and 1 special character (@ # % ^ & * ( ) !).");
      return res.redirect("/signup");
    }

    const newuser = new User({ email, username, role });
    await User.register(newuser, password);
    req.flash("success", "Account created! Please log in.");
    res.redirect("/login");
  } catch (err) {
    if (err.name === "UserExistsError") {
      req.flash("error", "Username already exists.");
    } else {
      req.flash("error", "Something went wrong. Please try again.");
    }
    res.redirect("/signup");
  }
});

// ── Login ─────────────────────────────────────────────────
app.get("/login", (req, res) => {
  res.render("trial/login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password.",
  }),
  async (req, res) => {
    const selectrole = req.body.role;
    const actualrole = req.user.role;

    if (selectrole === actualrole) {
      if (actualrole === "user")         return res.redirect("/user");
      if (actualrole === "receptionist") return res.redirect("/receptionist");
      return res.redirect("/home");
    } else {
      req.logout(() => {
        req.flash("error", "Selected role does not match your account.");
        res.redirect("/login");
      });
    }
  }
);

// ── Logout ────────────────────────────────────────────────
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) return res.redirect("/home");
    res.redirect("/home");
  });
});

// ════════════════════════════════════════════════════════════
//  EMERGENCY – public polling endpoint (patient side JS polls this)
// ════════════════════════════════════════════════════════════

app.get("/api/emergency/status", async (req, res) => {
  try {
    const emergency = await Emergency.findOne();
    if (!emergency) return res.json({ active: false, triggeredAt: null, message: "" });
    res.json({ active: emergency.active, triggeredAt: emergency.triggeredAt, message: emergency.message });
  } catch (err) {
    res.json({ active: false, triggeredAt: null, message: "" });
  }
});

// ════════════════════════════════════════════════════════════
//  USER ROUTES
// ════════════════════════════════════════════════════════════

app.get("/user", isLoggedIn, (req, res) => {
  res.render("trial/user");
});

// ── Patient Profile (self-view) ───────────────────────────
app.get("/user/profile", isLoggedIn, async (req, res) => {
  try {
    const patient = await User.findById(req.user._id);
    res.render("trial/user-profile", { patient });
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not load your profile.");
    res.redirect("/user");
  }
});

// ── Patient Profile (edit) ────────────────────────────────
app.get("/user/profile/edit", isLoggedIn, async (req, res) => {
  try {
    const patient = await User.findById(req.user._id);
    res.render("trial/user-edit-profile", { patient });
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not load profile editor.");
    res.redirect("/user/profile");
  }
});

app.post("/user/profile/edit", isLoggedIn, async (req, res) => {
  try {
    const {
      fullName, phone, emergencyContactName, emergencyContactPhone,
      bloodGroup, allergies, gender, age, email
    } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      fullName: fullName || "",
      phone: phone || "",
      emergencyContactName: emergencyContactName || "",
      emergencyContactPhone: emergencyContactPhone || "",
      bloodGroup: bloodGroup || "",
      allergies: allergies || "",
      gender: gender || "",
      age: age ? parseInt(age) : null,
      email: email || "",
    });
    
    req.flash("success", "Your profile has been updated successfully.");
    res.redirect("/user/profile");
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not update profile: " + err.message);
    res.redirect("/user/profile/edit");
  }
});


// ── Live Queue (Patient) ────────────────────────────────────────
app.get("/user/queue", isLoggedIn, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const todayStart = new Date(today + "T00:00:00.000Z");

    // All upcoming appointments (today and future)
    const appointments = await Appointment.find({
      user: req.user._id,
      date: { $gte: todayStart },
      status: { $ne: "Cancelled" }
    }).populate("doctor").sort({ date: 1 });

    // Today's queue entries for this patient
    const todayEntries = await QueueEntry.find({
      patient: req.user._id,
      date: today,
      status: { $nin: ["served", "skipped"] }
    }).populate("doctor").sort({ tokenNumber: 1 });

    res.render("trial/user-queue", { appointments, todayEntries, today });
  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading live queue.");
    res.redirect("/user");
  }
});

// ── Polling endpoint for queue status ─────────────────────
app.get("/api/queue/status", async (req, res) => {
  try {
    const { date, doctorId, patientId } = req.query;
    if (!date || !doctorId || !patientId) return res.json({ error: "Missing parameters" });

    const userEntry = await QueueEntry.findOne({ patient: patientId, date, doctor: doctorId }).sort({ createdAt: -1 });
    if (!userEntry) return res.json({ error: "Not found" });

    // Calculate position: how many are waiting before this token
    let position = 0;
    if (userEntry.status === "waiting") {
      position = await QueueEntry.countDocuments({
        doctor: doctorId,
        date: date,
        status: "waiting",
        tokenNumber: { $lte: userEntry.tokenNumber }
      });
    }

    const estimatedWaitMinutes = position > 0 ? (position - 1) * 10 : 0;

    const calledEntry = await QueueEntry.findOne({ doctor: doctorId, date, status: "called" }).sort({ createdAt: -1 });
    const calledToken = calledEntry ? calledEntry.tokenNumber : null;

    const totalWaiting = await QueueEntry.countDocuments({ doctor: doctorId, date, status: "waiting" });
    const totalServed  = await QueueEntry.countDocuments({ doctor: doctorId, date, status: "served" });

    res.json({
      tokenNumber: userEntry.tokenNumber,
      status: userEntry.status,
      position,
      estimatedWaitMinutes,
      calledToken,
      totalWaiting,
      totalServed
    });
  } catch (err) {
    res.json({ error: "Server error" });
  }
});

// ── Polling endpoint for receptionist: per-doctor queue stats ──
app.get("/api/queue/doctor-summary", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.json({ error: "Missing date" });

    const doctors = await Doctor.find().sort({ name: 1 });
    const summary = {};

    for (const doc of doctors) {
      const docId = doc._id.toString();
      const waiting = await QueueEntry.countDocuments({ doctor: docId, date, status: "waiting" });
      const called  = await QueueEntry.countDocuments({ doctor: docId, date, status: "called" });
      const served  = await QueueEntry.countDocuments({ doctor: docId, date, status: "served" });
      const skipped = await QueueEntry.countDocuments({ doctor: docId, date, status: "skipped" });

      const calledEntry = await QueueEntry.findOne({ doctor: docId, date, status: "called" }).sort({ createdAt: -1 });

      summary[docId] = {
        waiting, called, served, skipped,
        total: waiting + called + served + skipped,
        calledToken: calledEntry ? calledEntry.tokenNumber : null,
        calledPatient: calledEntry ? calledEntry.patientName : null
      };
    }

    res.json({ summary });
  } catch (err) {
    res.json({ error: "Server error" });
  }
});

// ── Full live-data endpoint for receptionist queue refresh ──
app.get("/api/queue/live-data", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.json({ error: "Missing date" });

    const doctors = await Doctor.find().sort({ name: 1 });

    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    const allQueueEntries = await QueueEntry.find({ date })
      .populate("doctor")
      .populate("patient")
      .populate("appointment")
      .sort({ tokenNumber: 1 });

    const allAppointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["Confirmed", "Pending"] },
    })
      .populate("user")
      .populate("doctor")
      .sort({ timeSlot: 1 });

    // Build a set of queued appointment IDs
    const queuedAppointmentIds = new Set(
      allQueueEntries
        .filter(q => q.appointment)
        .map(q => q.appointment._id.toString())
    );

    let totalWaiting = 0, totalServed = 0, totalCheckedIn = 0;

    const doctorData = doctors.map(doc => {
      const docId = doc._id.toString();
      const docQueue = allQueueEntries.filter(q => q.doctor && q.doctor._id.toString() === docId);
      const docAppts = allAppointments.filter(a => a.doctor && a.doctor._id.toString() === docId);

      const waitingCount = docQueue.filter(q => q.status === "waiting").length;
      const calledCount = docQueue.filter(q => q.status === "called").length;
      const servedCount = docQueue.filter(q => q.status === "served").length;
      const skippedCount = docQueue.filter(q => q.status === "skipped").length;

      totalWaiting += waitingCount;
      totalServed += servedCount;
      totalCheckedIn += docQueue.length;

      return {
        _id: docId,
        name: doc.name,
        specialization: doc.specialization,
        waitingCount,
        calledCount,
        servedCount,
        skippedCount,
        queueEntries: docQueue.map(q => ({
          _id: q._id,
          tokenNumber: q.tokenNumber,
          status: q.status,
          patientName: q.patientName || "Walk-in",
        })),
        scheduledAppts: docAppts.map(a => ({
          _id: a._id,
          patientName: a.user ? (a.user.fullName || a.user.username) : "Unknown",
          timeSlot: a.timeSlot,
          status: a.status,
          isQueued: queuedAppointmentIds.has(a._id.toString()),
        })),
      };
    });

    res.json({
      doctors: doctorData,
      totalWaiting,
      totalServed,
      totalCheckedIn,
    });
  } catch (err) {
    console.error(err);
    res.json({ error: "Server error" });
  }
});

// ── Book appointment ──────────────────────────────────────
app.get("/book", isLoggedIn, async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.render("trial/book", { doctors });
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not load doctors.");
    res.redirect("/user");
  }
});

app.post("/book", isLoggedIn, async (req, res) => {
  try {
    const { doctor, date, timeSlot } = req.body;
    const newAppointment = new Appointment({
      user: req.user._id,
      doctor,
      date,
      timeSlot,
    });
    await newAppointment.save();
    req.flash("success", "Appointment booked successfully! 🎉");
    res.redirect("/appointments");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error booking appointment. Please try again.");
    res.redirect("/book");
  }
});

// ── View appointments ─────────────────────────────────────
app.get("/appointments", isLoggedIn, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate("doctor")
      .sort({ date: 1 });
    res.render("trial/appointments", { appointments });
  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading appointments.");
    res.redirect("/user");
  }
});

// ── Reschedule ────────────────────────────────────────────
app.get("/reschedule/:id", isLoggedIn, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("doctor");
    const doctors     = await Doctor.find();
    res.render("trial/reschedule", { appointment, doctors });
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not load appointment.");
    res.redirect("/appointments");
  }
});

app.post("/reschedule/:id", isLoggedIn, async (req, res) => {
  try {
    const { doctor, date, timeSlot } = req.body;
    await Appointment.findByIdAndUpdate(req.params.id, { doctor, date, timeSlot });
    req.flash("success", "Appointment rescheduled successfully!");
    res.redirect("/appointments");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error rescheduling appointment.");
    res.redirect("/appointments");
  }
});

// ── Cancel (user) ─────────────────────────────────────────
app.post("/cancel/:id", isLoggedIn, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: "Cancelled" });
    req.flash("success", "Appointment cancelled.");
    res.redirect("/appointments");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error cancelling appointment.");
    res.redirect("/appointments");
  }
});

// ── Delete appointment (user) ──────────────────────────────
app.post("/appointments/:id/delete", isLoggedIn, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    req.flash("success", "Appointment deleted permanently.");
    res.redirect("/appointments");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error deleting appointment.");
    res.redirect("/appointments");
  }
});

// ── Patient: confirm proposed reschedule ──────────────────
app.post("/appointments/:id/confirm-reschedule", isLoggedIn, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt || !appt.reschedulePending) {
      req.flash("error", "No pending reschedule found.");
      return res.redirect("/appointments");
    }
    // Apply proposed changes
    await Appointment.findByIdAndUpdate(req.params.id, {
      date: appt.proposedDate,
      timeSlot: appt.proposedTimeSlot,
      doctor: appt.proposedDoctor,
      reschedulePending: false,
      proposedDate: null,
      proposedTimeSlot: null,
      proposedDoctor: null,
      status: "Confirmed",
    });
    // Mark the notification read
    await Notification.updateMany(
      { user: req.user._id, appointment: appt._id, type: "reschedule_proposed", isRead: false },
      { isRead: true }
    );
    req.flash("success", "Reschedule confirmed! Your appointment has been updated.");
    res.redirect("/appointments");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error confirming reschedule.");
    res.redirect("/appointments");
  }
});

// ── Patient: decline proposed reschedule (cancel the appointment) ──
app.post("/appointments/:id/decline-reschedule", isLoggedIn, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      req.flash("error", "Appointment not found.");
      return res.redirect("/appointments");
    }
    await Appointment.findByIdAndUpdate(req.params.id, {
      status: "Cancelled",
      reschedulePending: false,
      proposedDate: null,
      proposedTimeSlot: null,
      proposedDoctor: null,
    });
    // Mark the notification read
    await Notification.updateMany(
      { user: req.user._id, appointment: appt._id, type: "reschedule_proposed", isRead: false },
      { isRead: true }
    );
    req.flash("success", "You have cancelled this appointment.");
    res.redirect("/appointments");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error declining reschedule.");
    res.redirect("/appointments");
  }
});

// ── Patient notification polling API ─────────────────────
app.get("/api/notifications", isLoggedIn, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      isRead: false,
    })
      .populate("proposedDoctor")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ notifications });
  } catch (err) {
    res.json({ notifications: [] });
  }
});

// ── Dismiss a notification ────────────────────────────────
app.post("/api/notifications/:id/dismiss", isLoggedIn, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false });
  }
});

// ════════════════════════════════════════════════════════════
//  RECEPTIONIST ROUTES
// ════════════════════════════════════════════════════════════

// ── Dashboard ─────────────────────────────────────────────
app.get("/receptionist", isReceptionist, async (req, res) => {
  try {
    const [appointments, doctors] = await Promise.all([
      Appointment.find().populate("doctor").populate("user").sort({ date: 1 }),
      Doctor.find()
    ]);
    res.render("trial/receptionist", { appointments, doctors });
  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading appointments.");
    res.redirect("/home");
  }
});

// ── All appointments (same view, explicit route) ──────────
app.get("/receptionist/appointments", isReceptionist, async (req, res) => {
  try {
    const [appointments, doctors] = await Promise.all([
      Appointment.find().populate("doctor").populate("user").sort({ date: 1 }),
      Doctor.find()
    ]);
    res.render("trial/receptionist", { appointments, doctors });
  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading appointments.");
    res.redirect("/receptionist");
  }
});

// ── Receptionist reschedule PROPOSE (patient must confirm) ───
app.post("/receptionist/reschedule/:id", isReceptionist, async (req, res) => {
  try {
    const { doctor, date, timeSlot } = req.body;
    const appt = await Appointment.findById(req.params.id)
      .populate("user")
      .populate("doctor");
    if (!appt) {
      req.flash("error", "Appointment not found.");
      return res.redirect("/receptionist");
    }

    // Resolve proposed doctor name for notification message
    const proposedDoctorDoc = await Doctor.findById(doctor);
    const proposedDoctorName = proposedDoctorDoc ? proposedDoctorDoc.name : "Unknown";
    const proposedDateObj = new Date(date + "T00:00:00.000Z");

    // Store proposed details on the appointment
    await Appointment.findByIdAndUpdate(req.params.id, {
      reschedulePending: true,
      proposedDate: proposedDateObj,
      proposedTimeSlot: timeSlot,
      proposedDoctor: doctor,
    });

    // Notify the patient (only if appointment has a linked user)
    if (appt.user) {
      await Notification.create({
        user: appt.user._id,
        type: "reschedule_proposed",
        appointment: appt._id,
        message: `Your appointment has been rescheduled to ${proposedDateObj.toDateString()} at ${timeSlot} with Dr. ${proposedDoctorName}. Please confirm or cancel.`,
        proposedDate: proposedDateObj,
        proposedTimeSlot: timeSlot,
        proposedDoctor: doctor,
        originalDate: appt.date,
        originalTimeSlot: appt.timeSlot,
        doctorName: appt.doctor ? appt.doctor.name : "Unknown",
        proposedDoctorName,
      });
    }

    req.flash("success", "Reschedule proposal sent. Waiting for patient confirmation.");
    res.redirect("/receptionist");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error proposing reschedule.");
    res.redirect("/receptionist");
  }
});

// ── Confirm appointment ───────────────────────────────────
app.post("/receptionist/confirm/:id", isReceptionist, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: "Confirmed" });
    req.flash("success", "Appointment confirmed.");
    res.redirect("/receptionist");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error confirming appointment.");
    res.redirect("/receptionist");
  }
});

// ── Cancel appointment ────────────────────────────────────
app.post("/receptionist/cancel/:id", isReceptionist, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: "Cancelled" });
    req.flash("success", "Appointment cancelled.");
    res.redirect("/receptionist");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error cancelling appointment.");
    res.redirect("/receptionist");
  }
});

// ── Queue ─────────────────────────────────────────────────
app.get("/receptionist/queue", isReceptionist, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const dateParam = req.query.date || today;

    const startOfDay = new Date(dateParam + "T00:00:00.000Z");
    const endOfDay = new Date(dateParam + "T23:59:59.999Z");

    // Scheduled appointments for this date
    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["Confirmed", "Pending"] },
    })
      .populate("user")
      .populate("doctor")
      .sort({ timeSlot: 1 });

    const doctors = await Doctor.find().sort({ name: 1 });
    const queueEntries = await QueueEntry.find({ date: dateParam })
      .populate("doctor")
      .populate("patient")
      .populate("appointment")
      .sort({ tokenNumber: 1 });

    // Build a set of appointment IDs that already have queue entries
    const queuedAppointmentIds = new Set(
      queueEntries
        .filter(q => q.appointment)
        .map(q => q.appointment._id.toString())
    );

    res.render("trial/receptionist-queue", {
      doctors, queueEntries, dateParam, appointments, queuedAppointmentIds
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading queue.");
    res.redirect("/receptionist");
  }
});

// ── Check-in: move appointment to live queue ────────────────
app.post("/receptionist/queue/checkin/:id", isReceptionist, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate("user").populate("doctor");
    if (!appt) {
      req.flash("error", "Appointment not found.");
      return res.redirect("/receptionist/queue");
    }

    const dateParam = appt.date.toISOString().split("T")[0];

    // Check if already checked in
    const existing = await QueueEntry.findOne({ appointment: appt._id });
    if (existing) {
      req.flash("error", "This appointment is already checked in.");
      return res.redirect(`/receptionist/queue?date=${dateParam}`);
    }

    // Get next token number for this doctor on this date
    const highestToken = await QueueEntry.findOne({
      doctor: appt.doctor._id,
      date: dateParam
    }).sort({ tokenNumber: -1 });

    const newToken = highestToken ? highestToken.tokenNumber + 1 : 1;

    const newEntry = new QueueEntry({
      appointment: appt._id,
      patient: appt.user ? appt.user._id : null,
      patientName: appt.user ? (appt.user.fullName || appt.user.username) : "Unknown",
      doctor: appt.doctor._id,
      date: dateParam,
      tokenNumber: newToken,
      status: "waiting"
    });
    await newEntry.save();

    // Mark appointment as Confirmed (patient has arrived)
    await Appointment.findByIdAndUpdate(appt._id, { status: "Confirmed" });

    req.flash("success", `Checked in! Token #${newToken} assigned to ${newEntry.patientName}.`);
    res.redirect(`/receptionist/queue?date=${dateParam}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Error checking in patient.");
    res.redirect("/receptionist/queue");
  }
});

app.post("/receptionist/queue/walkin", isReceptionist, async (req, res) => {
  try {
    const { patientName, doctor, date, timeSlot } = req.body;

    // Create an appointment record for the walk-in
    const walkinAppt = new Appointment({
      doctor,
      date: new Date(date + "T00:00:00.000Z"),
      timeSlot: timeSlot || "Walk-in",
      status: "Confirmed"
    });
    await walkinAppt.save();

    // Get next token
    const highestToken = await QueueEntry.findOne({ doctor, date }).sort({ tokenNumber: -1 });
    const newToken = highestToken ? highestToken.tokenNumber + 1 : 1;

    const newEntry = new QueueEntry({
      appointment: walkinAppt._id,
      patientName: patientName || "Walk-in",
      doctor,
      date,
      tokenNumber: newToken,
      status: "waiting"
    });
    await newEntry.save();

    req.flash("success", `Walk-in Token #${newToken} added for ${newEntry.patientName}.`);
    res.redirect(`/receptionist/queue?date=${date}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Error adding walk-in to queue.");
    res.redirect("/receptionist/queue");
  }
});

app.post("/receptionist/queue/:id/call", isReceptionist, async (req, res) => {
  try {
    await QueueEntry.findByIdAndUpdate(req.params.id, { status: "called" });
    const entry = await QueueEntry.findById(req.params.id);
    req.flash("success", `Called token #${entry.tokenNumber}.`);
    res.redirect(`/receptionist/queue?date=${entry.date}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Error calling patient.");
    res.redirect("back");
  }
});

app.post("/receptionist/queue/:id/served", isReceptionist, async (req, res) => {
  try {
    await QueueEntry.findByIdAndUpdate(req.params.id, { status: "served" });
    const entry = await QueueEntry.findById(req.params.id);
    if (entry && entry.appointment) {
      await Appointment.findByIdAndUpdate(entry.appointment, { status: "Completed" });
    }
    req.flash("success", `Token #${entry.tokenNumber} marked as served.`);
    res.redirect(`/receptionist/queue?date=${entry.date}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Error updating status.");
    res.redirect("back");
  }
});

app.post("/receptionist/queue/:id/skip", isReceptionist, async (req, res) => {
  try {
    await QueueEntry.findByIdAndUpdate(req.params.id, { status: "skipped" });
    const entry = await QueueEntry.findById(req.params.id).populate("doctor");

    // Notify the patient if this is a registered user (not a walk-in)
    if (entry.patient) {
      const doctorName = entry.doctor ? entry.doctor.name : "your doctor";
      await Notification.create({
        user: entry.patient,
        type: "skipped",
        appointment: entry.appointment || null,
        message: `Your token #${entry.tokenNumber} was skipped in Dr. ${doctorName}'s queue. Please check with the reception desk to rejoin the queue.`,
      });
    }

    req.flash("success", `Token #${entry.tokenNumber} skipped.`);
    res.redirect(`/receptionist/queue?date=${entry.date}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Error skipping patient.");
    res.redirect("back");
  }
});

// ── Delete queue entry (served/skipped only) ──────────────
app.post("/receptionist/queue/:id/delete", isReceptionist, async (req, res) => {
  try {
    const entry = await QueueEntry.findById(req.params.id);
    if (!entry) {
      req.flash("error", "Queue entry not found.");
      return res.redirect("/receptionist/queue");
    }
    if (entry.status !== "served" && entry.status !== "skipped") {
      req.flash("error", "Only served or skipped entries can be deleted.");
      return res.redirect(`/receptionist/queue?date=${entry.date}`);
    }
    const dateStr = entry.date;
    await QueueEntry.findByIdAndDelete(req.params.id);
    req.flash("success", `Token #${entry.tokenNumber} removed from queue.`);
    res.redirect(`/receptionist/queue?date=${dateStr}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Error deleting queue entry.");
    res.redirect("/receptionist/queue");
  }
});

// ── Add patient ───────────────────────────────────────────
app.get("/receptionist/add-patient", isReceptionist, (req, res) => {
  res.render("trial/receptionist-add-patient");
});

app.post("/receptionist/add-patient", isReceptionist, async (req, res) => {
  try {
    const {
      username, email, password,
      fullName, phone, emergencyContactName, emergencyContactPhone,
      bloodGroup, allergies, gender, age
    } = req.body;

    const passRegex = /^(?=.*[A-Z])(?=.*[@#%\^&\*\(\)!]).{9,}$/;
    if (!passRegex.test(password)) {
      req.flash("error", "Password must be >8 characters, with at least 1 uppercase and 1 special character (@ # % ^ & * ( ) !).");
      return res.redirect("/receptionist/add-patient");
    }

    const newUser = new User({
      email,
      username,
      role: "user",
      fullName: fullName || "",
      phone: phone || "",
      emergencyContactName: emergencyContactName || "",
      emergencyContactPhone: emergencyContactPhone || "",
      bloodGroup: bloodGroup || "",
      allergies: allergies || "",
      gender: gender || "",
      age: age ? parseInt(age) : null,
      addedByReceptionist: true,
    });
    await User.register(newUser, password);
    req.flash("success", `Patient "${username}" registered successfully.`);
    res.redirect("/receptionist/patients");
  } catch (err) {
    if (err.name === "UserExistsError") {
      req.flash("error", "A user with that username already exists.");
    } else {
      req.flash("error", "Could not create patient: " + err.message);
    }
    res.redirect("/receptionist/add-patient");
  }
});

// ── List patients ─────────────────────────────────────────
app.get("/receptionist/patients", isReceptionist, async (req, res) => {
  try {
    const patients = await User.find({ role: "user" }).sort({ username: 1 });
    res.render("trial/receptionist-patients", { patients });
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not load patients.");
    res.redirect("/receptionist");
  }
});

// ── Edit patient (form) ───────────────────────────────────
app.get("/receptionist/patients/:id/edit", isReceptionist, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== "user") {
      req.flash("error", "Patient not found.");
      return res.redirect("/receptionist/patients");
    }
    res.render("trial/receptionist-edit-patient", { patient });
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not load patient.");
    res.redirect("/receptionist/patients");
  }
});

// ── Edit patient (save) ───────────────────────────────────
app.post("/receptionist/patients/:id/edit", isReceptionist, async (req, res) => {
  try {
    const {
      fullName, phone, emergencyContactName, emergencyContactPhone,
      bloodGroup, allergies, gender, age, email
    } = req.body;

    await User.findByIdAndUpdate(req.params.id, {
      fullName: fullName || "",
      phone: phone || "",
      emergencyContactName: emergencyContactName || "",
      emergencyContactPhone: emergencyContactPhone || "",
      bloodGroup: bloodGroup || "",
      allergies: allergies || "",
      gender: gender || "",
      age: age ? parseInt(age) : null,
      email: email || "",
    });
    req.flash("success", "Patient details updated successfully.");
    res.redirect("/receptionist/patients");
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not update patient: " + err.message);
    res.redirect(`/receptionist/patients/${req.params.id}/edit`);
  }
});

// ── Doctor listing (enhanced) ─────────────────────────────
app.get("/receptionist/doctors", isReceptionist, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.render("trial/receptionist-doctors", { doctors });
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not load doctors.");
    res.redirect("/receptionist");
  }
});

// ── Daily report ──────────────────────────────────────────
app.get("/receptionist/report", isReceptionist, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const dateParam = req.query.date || today;

    const doctors = await Doctor.find().sort({ name: 1 });

    // Get all DailyReport records for this date
    const reportRecords = await DailyReport.find({ date: dateParam });

    // Build a reportMap: doctorId -> expectedCount
    const reportMap = {};
    reportRecords.forEach(r => {
      reportMap[r.doctor.toString()] = r.expectedCount;
    });

    // Count actual appointments per doctor for the selected date
    const startOfDay = new Date(dateParam + "T00:00:00.000Z");
    const endOfDay   = new Date(dateParam + "T23:59:59.999Z");

    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "Cancelled" }
    }).populate("doctor");

    const actualMap = {};
    appointments.forEach(appt => {
      if (appt.doctor) {
        const id = appt.doctor._id.toString();
        actualMap[id] = (actualMap[id] || 0) + 1;
      }
    });

    // Combine into report data
    const reportData = doctors.map(doc => {
      const id = doc._id.toString();
      return {
        doctor: doc,
        expected: reportMap[id] || 0,
        actual: actualMap[id] || 0,
      };
    });

    res.render("trial/receptionist-report", { reportData, dateParam });
  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading report.");
    res.redirect("/receptionist");
  }
});

// ── Save expected count for a doctor+date ─────────────────
app.post("/receptionist/report/expected", isReceptionist, async (req, res) => {
  try {
    const { doctorId, date, expectedCount } = req.body;
    await DailyReport.findOneAndUpdate(
      { doctor: doctorId, date },
      { expectedCount: parseInt(expectedCount) || 0 },
      { upsert: true, new: true }
    );
    req.flash("success", "Expected count updated.");
    res.redirect(`/receptionist/report?date=${date}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not save expected count.");
    res.redirect("/receptionist/report");
  }
});

// ── Emergency – trigger ───────────────────────────────────
app.post("/receptionist/emergency/trigger", isReceptionist, async (req, res) => {
  try {
    const { message } = req.body;
    await Emergency.findOneAndUpdate(
      {},
      {
        active: true,
        triggeredAt: new Date(),
        message: message || "Emergency Alert! Please follow staff instructions.",
      },
      { upsert: true, new: true }
    );
    req.flash("success", "Emergency alert has been activated.");
    res.redirect("/receptionist");
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not trigger emergency alert.");
    res.redirect("/receptionist");
  }
});

// ── Emergency – clear ─────────────────────────────────────
app.post("/receptionist/emergency/clear", isReceptionist, async (req, res) => {
  try {
    await Emergency.findOneAndUpdate({}, { active: false, triggeredAt: null }, { upsert: true });
    req.flash("success", "Emergency alert cleared.");
    res.redirect("/receptionist");
  } catch (err) {
    console.log(err);
    req.flash("error", "Could not clear emergency alert.");
    res.redirect("/receptionist");
  }
});

// ════════════════════════════════════════════════════════════
app.listen(8080, () => console.log("Server running on http://localhost:8080"));
