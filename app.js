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
  };
  return i[name] || "";
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
//  USER ROUTES
// ════════════════════════════════════════════════════════════

app.get("/user", isLoggedIn, (req, res) => {
  res.render("trial/user");
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
    res.redirect("/appointments");           // ← redirect to appointments with flash
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
    const doctors     = await Doctor.find();         // ← FIX: pass doctors to template
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

// ── Receptionist reschedule ───────────────────────────────
app.post("/receptionist/reschedule/:id", isReceptionist, async (req, res) => {
  try {
    const { doctor, date, timeSlot } = req.body;
    await Appointment.findByIdAndUpdate(req.params.id, { doctor, date, timeSlot });
    req.flash("success", "Appointment rescheduled successfully.");
    res.redirect("/receptionist");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error rescheduling appointment.");
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
    const doctors = await Doctor.find();
    // Queue stored in session for now (no separate model needed)
    const queueEntries = req.session.queue || [];
    res.render("trial/receptionist-queue", { doctors, queueEntries });
  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading queue.");
    res.redirect("/receptionist");
  }
});

app.post("/receptionist/queue/add", isReceptionist, async (req, res) => {
  try {
    const { patientName, doctor } = req.body;
    if (!req.session.queue) req.session.queue = [];
    const token = (req.session.queue.length > 0
      ? Math.max(...req.session.queue.map(e => e.tokenNumber)) + 1
      : 1);
    let doctorObj = null;
    if (doctor) {
      doctorObj = await Doctor.findById(doctor);
    }
    req.session.queue.push({
      _id: Date.now().toString(),
      tokenNumber: token,
      patientName,
      doctor: doctorObj,
      createdAt: new Date()
    });
    req.flash("success", `Token #${token} added for ${patientName}.`);
    res.redirect("/receptionist/queue");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error adding to queue.");
    res.redirect("/receptionist/queue");
  }
});

app.post("/receptionist/queue/next", isReceptionist, (req, res) => {
  if (!req.session.queue) req.session.queue = [];
  if (req.session.queue.length > 0) {
    const served = req.session.queue.shift();
    req.flash("success", `Called token #${served.tokenNumber} – ${served.patientName}.`);
  } else {
    req.flash("error", "Queue is already empty.");
  }
  res.redirect("/receptionist/queue");
});

app.post("/receptionist/queue/remove/:id", isReceptionist, (req, res) => {
  if (req.session.queue) {
    req.session.queue = req.session.queue.filter(e => e._id !== req.params.id);
  }
  req.flash("success", "Patient removed from queue.");
  res.redirect("/receptionist/queue");
});

// ── Add patient ───────────────────────────────────────────
app.get("/receptionist/add-patient", isReceptionist, (req, res) => {
  res.render("trial/receptionist-add-patient");
});

app.post("/receptionist/add-patient", isReceptionist, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username, role: "user" });
    await User.register(newUser, password);
    req.flash("success", `Patient account for "${username}" created successfully.`);
    res.redirect("/receptionist/add-patient");
  } catch (err) {
    if (err.name === "UserExistsError") {
      req.flash("error", "A user with that username already exists.");
    } else {
      req.flash("error", "Could not create patient: " + err.message);
    }
    res.redirect("/receptionist/add-patient");
  }
});

// ── Daily report ──────────────────────────────────────────
app.get("/receptionist/report", isReceptionist, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor")
      .populate("user")
      .sort({ date: 1 });
    res.render("trial/receptionist-report", { appointments });
  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading report.");
    res.redirect("/receptionist");
  }
});

// ════════════════════════════════════════════════════════════
app.listen(8080, () => console.log("Server running on http://localhost:8080"));
