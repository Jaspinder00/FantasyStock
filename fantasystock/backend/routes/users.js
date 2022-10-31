const bodyParser = require("body-parser");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

var jsonParser = bodyParser.json();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/register/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      await User.findOrCreate(
        { googleId: profile.id },
        {
          displayName: profile.displayName,
          familyName: profile.name.familyName,
          givenName: profile.name.givenName,
          photo: profile.photos[0].value,
        },
        (err, user) => cb(err, user)
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/register/protected");
  }
);

router.get("/auth/failure", (req, res) => {
  res.send("something went wrong..");
});

router.get("/protected", isLoggedIn, (req, res) => {
  res.redirect("http://localhost:3000/loggedin");
});

router.get("/checkAuthentication", (req, res) => {
  const authenticated = req.user !== undefined;

  res.status(200).json({
    authenticated,
  });
});

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get(
  "/profilepicture",
  isLoggedIn,
  async (req, res) =>
    await User.findById(req.user._id)
      .then((aUser) => res.send(aUser.photo))
      .catch((err) => console.log(err))
);

router.get(
  "/profile",
  isLoggedIn,
  async (req, res) =>
    await User.findById(req.user._id).then((aUser) => res.send(aUser))
);

router.patch("/edit", isLoggedIn, jsonParser, async (req, res) => {
  if (req.body.username.length <= 32 && req.body.bio.length <= 300) {
    await User.findByIdAndUpdate(
      { _id: req.user._id },
      {
        username: req.body.username,
        bio: req.body.bio,
      }
    );
  }
});

router.delete("/delete", isLoggedIn, async (req, res) => {
  try {
    await User.findByIdAndDelete({ _id: req.user._id })
      .then((req1, res1) => {
        req.logout(function (err) {
          if (err) {
            console.log(err);
            return;
          }
          return res.redirect("/");
        });
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", (req, res) => {
  User.findById(req.params.id, (err, docs) =>
    err ? console.log(err) : console.log(result)
  );
});

module.exports = router;
