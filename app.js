const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsmate = require("ejs-mate");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const User = require("./modules/user");
const flash = require("connect-flash");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

main()
  .then(() => {
    console.log("MongoDb connect");
  })
  .catch((err) => {
    console.log(`Mongodb error:${err}`);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/mediflow");
}

const sessionOptions = {
  secret: "sdfdf",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.curruser = req.user;

  next();
});

app.get("/root", (req, res) => {
  res.send("Hi I am root");
});

app.get("/signup", (req, res) => {
  res.render("trial/signup");
});

app.post("/signup", async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    const newuser = new User({ email, username, role });

    await User.register(newuser, password);

    res.redirect("/login");
  } catch (err) {
    if (err.name === "UserExistsError") {
      req.flash("error", "Username already exists");
    } else {
      req.flash("error", "Something went wrong");
    }
    res.redirect("/signup");
  }
});

app.get("/login", (req, res) => {
  res.render("trial/login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password",
  }),
  async (req, res) => {
    const selectrole = req.body.role;
    const actualrole = req.user.role;

    if (selectrole == actualrole) {
      if (actualrole === "user") {
        return res.redirect("/user");
      }

      if (actualrole === "receptionist") {
        return res.redirect("/receptionist");
      }

      return res.redirect("/home");
    } else {
      req.logOut(() => {
        req.flash("error", "Role does not match");
        res.redirect("/login");
      });
    }
  },
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
        req.flash("success","You have Looged out ")
      return res.redirect("/home");
    }
    res.redirect("/home");
  });
});

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
}

app.get("/user", isLoggedIn, (req, res) => {
  res.render("trial/user");
});

app.get("/receptionist", isLoggedIn, (req, res) => {
  res.render("trial/receptionist");
});

app.get("/home", (req, res) => {
  res.render("trial/home");
});

app.listen(8080, () => {
  console.log("server is listening");
});
