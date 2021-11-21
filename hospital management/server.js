const express = require("express");
const bodyParser = require("body-Parser");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const {name} = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(
  session({
    secret: "#12345",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URL);

const userSchema = new mongoose.Schema({
  email: String,
  passport: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("users", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const customerSchema = {
  userId: String,
  roomNo: Number,
  name: String,
  mobileNo: Number,
  address: String,
  aadharNo: Number,
  city: String,
  state: String,
  zip: Number,
};

const Customer = mongoose.model("customers", customerSchema);

app.get("/", (req, res) => {
  res.render("view");
});

app.get("/admin", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("admin");
  } else {
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("register");
  } else {
    res.redirect("/");
  }
});

app.get("/update", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("search", {
      Option: "Update",
      buttonName: "Search",
      url: "update",
    });
  } else {
    res.redirect("/");
  }
});

app.get("/search", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("search", {
      Option: "Search",
      buttonName: "Search",
      url: "search",
    });
  } else {
    res.redirect("/");
  }
});

app.get("/delete", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("search", {
      Option: "Delete",
      buttonName: "Delete",
      url: "Delete",
    });
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.post("/", (req, res) => {
  // User.register({username: req.body.username}, req.body.password)
  //   .then(User => {
  //     passport.authenticate("local")(req, res, () => {
  //       res.redirect("/admin");
  //     });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     res.redirect("/");
  //   });
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, err => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/admin");
      });
    }
  });
});

app.post("/admin", (req, res) => {
  const customer = new Customer(req.body);

  customer.save().then(() => {
    res.render("success", {
      subTitle: "Delete",
      subject: "added",
    });
  });
});

app.post("/search", (req, res) => {
  Customer.findOne({userId: req.body.userId}).then(userData => {
    if (userData) {
      res.render("searchResults", {
        userId: userData.userId,
        roomNo: userData.roomNo,
        name: userData.name,
        mobileNo: userData.mobileNo,
        address: userData.address,
        aadhaarNo: userData.aadhaarNo,
        city: userData.city,
        state: userData.state,
        zip: userData.zip,
      });
    } else {
      res.render("searchFailure", {
        url: "search",
      });
    }
  });
});

app.post("/delete", (req, res) => {
  Customer.findOneAndDelete({userId: req.body.userId}).then(() => {
    res.render("success", {
      subTitle: "Delete",
      subject: "added",
    });
  });
});

app.post("/update", (req, res) => {
  Customer.findOne({userId: req.body.userId}).then(userData => {
    if (userData) {
      res.render("updatePage", {
        userId: userData.userId,
        roomNo: userData.roomNo,
        name: userData.name,
        mobileNo: userData.mobileNo,
        address: userData.address,
        aadhaarNo: userData.aadhaarNo,
        city: userData.city,
        state: userData.state,
        zip: userData.zip,
      });
    } else {
      res.render("searchFailure", {
        url: "update",
      });
    }
  });
});

app.post("/updateResults", (req, res) => {
  Customer.findOneAndUpdate({userId: req.body.userId}, req.body).then(() => {
    res.render("success", {
      subTitle: "Updated",
      subject: "updated",
    });
  });
});

app.listen(5000, () => {
  console.log("server is running");
});
