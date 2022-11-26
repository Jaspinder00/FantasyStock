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
    req.body.username === undefined || // username must be defined
    req.body.username.length > 32 || // username must be less than or equal to 32 chars
    req.body.username.length < 1 || // username must be more than or equal to 1 char
    typeof req.body.username !== "string" || // username must be a string
    req.body.bio.length > 300 || // bio must be less than or equal to 300 chars
    req.body.bio.length < 1 || // bio must be more than or equal to 1 char
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

  // data validation is successful so go update
  await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      username: req.body.username,
      bio: req.body.bio,
      activeIcon: req.body.activeIcon,
    }
  );
  console.log("Successfully edited your profile.");
  res.send({ created: false });
  return;
});

router.delete("/delete", isLoggedIn, async (req, res) => {

  // before deleting the user account:

  // 1
  // get all users in db
  const users = await User.find();
  // only perform modification if more than 1 user exists
  if(users.length > 1){
    // loop through the users
    for(let i = 0; i < users.length; i++){
      // grab _id of the user
      let u = JSON.stringify(users[i]._id);
      u = u.replaceAll("\"", "");
      //console.log(u);
      //console.log(req.user._id);
      // only try to modify users that are not the current user logged in
      if(u !== req.user._id){
        // filter out the current user from user2's friendRequests
        users[i].friendRequests = users[i].friendRequests.filter(
          (ele) => ele.toString() !== req.user._id
        )
        // save user
        users[i].save();
        console.log("Removed user being deleted from friendRequests list of all other users in db.");
      }
    }
  }

  // 2
  // grab current user trying to delete their account
  const user = await User.findById(req.user._id);
  // proceed if the current user has friends
  if (user.friends.length !== 0) {
    // now loop through the user's friends
    for (let i = 0; i < user.friends.length; i++) {
      // grab the friend
      const friend = await User.findById(user.friends[i]);
      // filter out the current user from friend's friend list
      friend.friends = friend.friends.filter(
        (ele) => ele.toString() !== req.user._id
      );
      // save the friend's account
      friend.save();
      console.log("Removed user being deleted from friends list of the user's friends.");
    }
  }

  // 3
  // pathway to modify activeLeagues only if current user was in an activeLeague
  if(user.activeLeagues.length !== 0){

    // loop through each activeLeagues pertaining to the user whose account will be deleted
    for(let i = 0; i < user.activeLeagues.length; i++){

      // grab activeLeague id
      let leagueID = user.activeLeagues[i];
      //console.log(leagueID);
      // grab league
      const userLeague = await League.findById({ _id: leagueID });

      let userLeagueHost = JSON.stringify(userLeague.host);
      //console.log(userLeagueHost);
      userLeagueHost = userLeagueHost.replaceAll("\"", "");
      //console.log(userLeagueHost);
      //console.log(req.user._id);

      // if current user is the host of a league proceed
      if(userLeagueHost === req.user._id){
  
        console.log("User being deleted is a host of a league");
        //console.log(userLeague.players.length);

        // before league deletion remove the activeLeague from all of the profiles of all of the users that were in that league
        if(userLeague.players.length > 1){
          // loop
          for(let j = 1; j < userLeague.players.length; j++){
            let temp_user = JSON.stringify(userLeague.players[j].player);
            temp_user = temp_user.replaceAll("\"", "");
            console.log("non member: " + temp_user);
            try{
              // grab the user
              const player = await User.findById({ _id: temp_user});
              //console.log(player.activeLeagues[0]);
              //console.log(leagueID);

              // update the user's activeLeagues
              player.activeLeagues = player.activeLeagues.filter(
                (ele) => ele.toString() === leagueID
              );
              // save player
              player.save();
              console.log("activeLeague was removed from a member's activeLeagues list");
            } 
            catch(error) {
              console.log(error);
            }
          }
        }
        
        // perform league deletion now
        try{
          await League.findByIdAndDelete({ _id: leagueID})
            .then((req1, res1) => {
              console.log("host league deleted");
              //return res.redirect("/");
            });
        } catch (error){
          console.log(error);
        }

      }
      // if user is not a host, then they are a member of the league
      else{
        console.log("User being deleted is a member of a league");

        // perform league modification
        try{

          // if comments exist in the league proceed
          if(userLeague.commentsection.length !== 0){

            // filtering out comments in the league that belong to the user whose account will be deleted
            userLeague.commentsection = userLeague.commentsection.filter(function(c){
              return c.owner.toString() !== req.user._id;
            });
            console.log("Removing comments made by the user that will be deleted.");

            // loop through each comment to check the replies
            for(let j = 0; j < userLeague.commentsection.length; j++){

              // only proceed if replies exist in that comment
              if(userLeague.commentsection[j].replies.length !== 0){

                // filtering out replies in the commentsection that belong to the user whose account will be deleted
                userLeague.commentsection[j].replies = userLeague.commentsection[j].replies.filter(function(r){
                  return r.replyowner.toString() !== req.user._id;
                });
                console.log("Removing replies made by the user that will be deleted.");

              }
            }
          }

          // filtering out the user whose account will be deleted from the players array in the league
          userLeague.players = userLeague.players.filter(function(p){
            return p.player.toString() !== req.user._id;
          });
          console.log("Removed the user from the league");

          // save changes to the league
          userLeague.save();
          console.log("Saving changes made to the league.");

        } 
        catch (error){
          console.log(error);
        }
      }
    }
  }

  // 4
  // pathway to modify passedLeagues only if current user was in a passedLeague
  if(user.passedLeagues.length !== 0){

    // loop through each passedLeagues pertaining to the user whose account will be deleted
    for(let i = 0; i < user.passedLeagues.length; i++){

      // grab passedLeague id
      let leagueID = user.passedLeagues[i];
      //console.log(leagueID);
      // grab league
      const userLeague = await League.findById({ _id: leagueID });

      let userLeagueHost = JSON.stringify(userLeague.host);
      //console.log(userLeagueHost);
      userLeagueHost = userLeagueHost.replaceAll("\"", "");
      //console.log(userLeagueHost);
      //console.log(req.user._id);

      // if current user is the host of a league proceed
      if(userLeagueHost === req.user._id){
  
        console.log("User being deleted is a host of a league");
        //console.log(userLeague.players.length);

        // before league deletion remove the passedLeague from all of the profiles of all of the users that were in that league
        if(userLeague.players.length > 1){
          // loop
          for(let j = 1; j < userLeague.players.length; j++){
            let temp_user = JSON.stringify(userLeague.players[j].player);
            temp_user = temp_user.replaceAll("\"", "");
            console.log("non member: " + temp_user);
            try{
              // grab the user
              const player = await User.findById({ _id: temp_user});
              //console.log(player.passedLeagues[0]);
              //console.log(leagueID);

              // update the user's passedLeagues
              player.passedLeagues = player.passedLeagues.filter(
                (ele) => ele.toString() === leagueID
              );
              // save player
              player.save();
              console.log("passedLeague was removed from a member's passedLeagues list");
            } 
            catch(error) {
              console.log(error);
            }
          }
        }
        
        // perform league deletion now
        try{
          await League.findByIdAndDelete({ _id: leagueID})
            .then((req1, res1) => {
              console.log("host league deleted");
              //return res.redirect("/");
            });
        } catch (error){
          console.log(error);
        }

      }
      // if user is not a host, then they are a member of the league
      else{
        console.log("User being deleted is a member of a league");

        // perform league modification
        try{

          // if comments exist in the league proceed
          if(userLeague.commentsection.length !== 0){

            // filtering out comments in the league that belong to the user whose account will be deleted
            userLeague.commentsection = userLeague.commentsection.filter(function(c){
              return c.owner.toString() !== req.user._id;
            });
            console.log("Removing comments made by the user that will be deleted.");

            // loop through each comment to check the replies
            for(let j = 0; j < userLeague.commentsection.length; j++){

              // only proceed if replies exist in that comment
              if(userLeague.commentsection[j].replies.length !== 0){

                // filtering out replies in the commentsection that belong to the user whose account will be deleted
                userLeague.commentsection[j].replies = userLeague.commentsection[j].replies.filter(function(r){
                  return r.replyowner.toString() !== req.user._id;
                });
                console.log("Removing replies made by the user that will be deleted.");

              }
            }
          }

          // filtering out the user whose account will be deleted from the players array in the league
          userLeague.players = userLeague.players.filter(function(p){
            return p.player.toString() !== req.user._id;
          });
          console.log("Removed the user from the league");

          // save changes to the league
          userLeague.save();
          console.log("Saving changes made to the league.");

        } 
        catch (error){
          console.log(error);
        }
      }
    }
  }

  // finally delete user's account here
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
    req.body.friendcode.length !== 24 || // friendcode input must be 24 chars
    typeof req.body.friendcode !== "string" || // friendcode input must be a string
    req.body.friendcode === req.user._id // user can not add him/herself as a friend
  ) {
    console.log("Could not send friend request because friendcode is invalid.");
    res.send({ created: false });
    return;
  }

  // more input data validation
  try {
    // grab the current user
    const user = await User.findById(req.user._id);
    // grab the friend by friendcode
    const friend = await User.findById(req.body.friendcode);

    // 1
    // user1 can not send a friend request to user2 if user1 has already received a friend request from user2
    // user1 can not send a friend request to user2 if user2 has already received a friend request from user1
    if (user.friendRequests.includes(friend._id) || 
        friend.friendRequests.includes(user._id))
    {
      console.log("Could not send friend request, either you have a pending friend request from them or they have a pending friend request from you.");
      res.send({ created: false});
      return;
    }

    // 2
    // user1 can not send a friend request to user2 if user1 is already friends with user2
    if (user.friends.includes(friend._id) ||
        friend.friends.includes(user._id))
    {
      console.log("Could not send friend request, you are already friends with this user.");
      res.send({ created: false });
      return;
    }
  } 
  catch (e) {
    console.log(e);
    res.send({ created: false });
    return;
  }

  // data validation is successful
  try {
    const user = await User.findById(req.user._id);
    const friend = await User.findById(req.body.friendcode);

    friend.friendRequests.push(user);
    friend.save();

    console.log("Friend request sent.");
  }
  catch (e) {
    console.log(e);
    res.send({ created: false });
    return;
  }
});

router.patch("/deletefriend", isLoggedIn, jsonParser, async (req, res) => {
  // input data validation
  if (
    req.body.friendcode === undefined || // friendcode must be defined
    req.body.friendcode.length !== 24 || // friendcode input must be 24 chars
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
      req.body.friendcode.length !== 24 // friendcode must be 24 chars
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
    req.body.friendcode.length !== 24 // friendcode must be 24 chars
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

    let isFriend = theUser.friends.reduce(
      (acc, ele) => acc || ele.toString() === req.params.id,
      false
    );

    isFriend |= req.user._id === req.params.id;

    // console.log({ ...aUser, success: true });

    res.send({ ...aUser, success: true, isFriend });
  } catch (e) {
    console.log(e);
    res.send({ success: false });
    return;
  }
});

module.exports = router;
