const bodyParser = require("body-parser");
const User = require("../models/user");
const League = require("../models/league");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { findById } = require("../models/stock");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const adjectives = require("../data/adjectives");
const animals = require("../data/animals");
const user = require("../models/user");

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
          username: `${
            adjectives[Math.floor(Math.random() * adjectives.length)]
          } ${animals[Math.floor(Math.random() * animals.length)]}`,
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
  const user = await User.findById(req.user._id);

  // data validation for 'username', 'bio', and 'activeIcon' attributes
  if (
    req.body.username.length > 32 || // username must be less than or equal to 32 chars
    req.body.username === undefined || // username must be defined
    typeof req.body.username !== "string" || // username must be a string
    req.body.bio.length > 300 || // bio must be less than or equal to 300 chars
    req.body.bio === undefined || // bio must be defined
    typeof req.body.bio !== "string" || // bio must be a string
    req.body.activeIcon === undefined || // activeIcon must be defined
    typeof req.body.activeIcon !== "string" || // activeIcon must be a string
    !user.icons.includes(req.body.activeIcon)
  ) {
    // activeIcon requested to switch must be owned by user already
    console.log("Edit failed due to input errors");
    res.send({ created: false });
    return;
  }

  if (
    req.body.username.length <= 32 &&
    req.body.bio.length <= 300 &&
    user.icons.includes(req.body.activeIcon)
  ) {
    await User.findByIdAndUpdate(
      { _id: req.user._id },
      {
        username: req.body.username,
        bio: req.body.bio,
        activeIcon: req.body.activeIcon,
      }
    );
  }
  res.send({ created: false });
  return;
});

router.delete("/delete", isLoggedIn, async (req, res) => {

  // before deleting account grab the current user
  const user = await User.findById(req.user._id);
  if(user.friends.length !== 0){
    // now loop through the user's friend's account
    for(let i = 0; i < user.friends.length; i++){
      // grab the friend
      const friend = await User.findById(user.friends[i]);
      // now remove current user from friend's friend list
      friend.friends = friend.friends.filter(
        (ele) => ele.toString() !== req.user._id
      );
      friend.save();
      console.log("user has been deleted from " + friend._id + "'s friends list");
    }
  }

  try {
    await User.findByIdAndDelete({ _id: req.user._id })
      .then((req1, res1) => {
        req.logout(function (err) {
          if (err) {
            console.log(err);
            res.send({ created: false });
            return;
          }
          return res.redirect("/");
        });
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
  }
  //res.send({ created: false });
  return;
});

router.patch("/addfriend", isLoggedIn, jsonParser, async (req, res) => {
  // input data validation
  if (
    req.body.friendcode === undefined || // friendcode must be defined
    req.body.friendcode.length > 32 || // friendcode input must be 32 chars or less
    typeof req.body.friendcode !== "string" || // friendcode input must be a string
    req.body.friendcode === req.user._id
  ) {
    // user can not add him/herself as a friend
    console.log("Invalid friend code");
    res.send({ created: false });
    return;
  }

  // more input data validation
  const friend = await User.findById(req.body.friendcode);
  if (friend.friendRequests.includes(req.user._id)) {
    console.log("You have already sent this user a friend request.");
    res.send({ created: false });
    return;
  }
  if (friend.friends.includes(req.user._id)) {
    console.log("This user is already your friend.");
    res.send({ created: false });
    return;
  }

  // data validation is successful
  try {
    //console.log(req.user._id);
    //console.log(req.body.friendcode);
    const user = await User.findById(req.user._id);
    const friend = await User.findById(req.body.friendcode);
    //console.log(user);
    //console.log(friend);

    friend.friendRequests.push(user);
    friend.save();

    console.log("friend request sent");
  } catch {}
});

router.patch("/deletefriend", isLoggedIn, jsonParser, async (req, res) => {
  // input data validation
  if (
    req.body.friendcode === undefined || // friendcode must be defined
    req.body.friendcode.length > 32 || // friendcode input must be 32 chars or less
    typeof req.body.friendcode !== "string" || // friendcode input must be a string
    req.body.friendcode === req.user._id
  ) {
    // user can not delete him/herself as a friend
    console.log("Invalid friend code");
    res.send({ created: false });
    return;
  }

  // data validation is successful
  try {
    const user = await User.findById(req.user._id);
    const friend = await User.findById(req.body.friendcode);

    // console.log(req.body.friendcode);

    console.log(
      user.friends.filter((ele) => ele.toString() !== req.body.friendcode)
    );

    // deleting user's friend
    user.friends = user.friends.filter(
      (ele) => ele.toString() !== req.body.friendcode
    );
    user.save();
    // deleting friend's friend
    friend.friends = friend.friends.filter(
      (ele) => ele.toString() !== req.user._id
    );
    friend.save();

    res.send({ success: true });
    return;
  } catch (err) {
    console.log(err);
    res.send({ success: false });
    return;
  }
  res.send({ success: false });
  return;
});

router.get("/friends", async (req, res) => {
  const user = await User.findById(req.user._id);
  const allFriends = [];

  await Promise.all(
    user.friends.map(async (ele) => {
      const tmp = await User.findById(ele);
      allFriends.push(tmp);
    })
  );

  res.send(allFriends);
});

router.get("/friendsrequests", async (req, res) => {
  const user = await User.findById(req.user._id);
  const allFriends = [];

  await Promise.all(
    user.friendRequests.map(async (ele) => {
      const tmp = await User.findById(ele);
      allFriends.push(tmp);
    })
  );

  res.send(allFriends);
});

router.get("/view/leagues", isLoggedIn, async (req, res) => {
  const host = await User.findById({ _id: req.user._id });

  const activeLeagues = await Promise.all(
    host.activeLeagues.map(async (leagueID) => {
      const aLeague = await League.findById({ _id: leagueID });
      return { title: aLeague.title, _id: leagueID };
    })
  );

  const passedLeagues = await Promise.all(
    host.passedLeagues.map(async (leagueID) => {
      const aLeague = await League.findById({ _id: leagueID });
      return { title: aLeague.title, _id: leagueID };
    })
  );

  const allLeagues = {
    activeLeagues,
    passedLeagues,
  };

  res.send(allLeagues);
});

// DOES NOT WORK
router.patch(
  "/friend/request/accept",
  isLoggedIn,
  jsonParser,
  async (req, res) => {
    // CHECK TO SEE IF ALL PARAMETERS EXIST
    // CHECK FRIEND REQUESTS TO SEE IF USER TO BE ADDED IS THERE
    // CHECK TO SEE IF USER EXISTS
    // MOVE USER FROM FRIEND REQUEST LIST TO FRIENDS LIST
    // SAVE
    if (
      req.body.friendcode === undefined || // friendcode must be defined
      typeof req.body.friendcode !== "string" || // friendcode must be of type string
      req.body.friendcode.length > 32 // friendcode must be 32 or less chars
    ) {
      console.log("Could not accept friend request.");
      return;
    }

    // two users add each other as friend
    try {
      // GET CURRENT USER
      const user = await User.findById(req.user._id);

      // GET FRIEND
      const friend = await User.findById(req.body.friendcode);

      // ADD FRIEND TO FRIENDS LIST
      user.friends.push(friend);
      friend.friends.push(user);

      // REMOVE FRIEND FROM FRIEND REQUEST LIST
      user.friendRequests = user.friendRequests.filter(
        (request) => request.toString() !== friend._id.toString()
      );

      // SAVE USER DATA
      user.save();
      friend.save();
      res.send({ success: true });
      return;
    } catch (e) {
      console.log(e);
      res.send({ success: false });
      return;
    }
    res.send({ success: false });
    return;
  }
);

// DOES NOT WORK
router.patch("/friend/request/decline", jsonParser, async (req, res) => {
  // CHECK TO SEE IF ALL PARAMETERS EXIST
  // CHECK FRIEND REQUESTS TO SEE IF USER TO BE ADDED IS THERE
  // CHECK TO SEE IF USER EXISTS
  // REMOVE USER FROM FRIEND REQUEST LIST
  // SAVE
  if (
    req.body.friendcode === undefined || // friendcode must be defined
    typeof req.body.friendcode !== "string" || // friendcode must be of type string
    req.body.friendcode.length > 32 // friendcode must be 32 or less chars
  ) {
    console.log("Could not accept friend request.");
    res.send({ created: false });
    return;
  }

  try {
    // GET CURRENT USER
    const user = await User.findById(req.user._id);

    // GET FRIEND
    const friend = await User.findById(req.body.friendcode);

    // REMOVE FRIEND FROM FRIEND REQUEST LIST
    user.friendRequests = user.friendRequests.filter(
      (request) => request.toString() !== friend._id.toString()
    );

    // SAVE USER DATA
    user.save();
    res.send({ success: true });
    return;
  } catch (e) {
    console.log(e);
    res.send({ success: false });
    return;
  }
  res.send({ success: false });
  return;
});

router.get("/:id", async (req, res) => {
  try {
    const aUser = await User.findById(req.params.id);
    const theUser = await User.findById(req.user._id);
    if (aUser === null || theUser === null) {
      res.send({ success: false });
      return;
    }

    const isFriend = theUser.friends.reduce(
      (acc, ele) => acc || ele.toString() === req.params.id,
      false
    );

    // console.log({ ...aUser, success: true });

    res.send({ ...aUser, success: true });
  } catch (e) {
    console.log(e);
    res.send({ success: false });
    return;
  }
});

module.exports = router;
