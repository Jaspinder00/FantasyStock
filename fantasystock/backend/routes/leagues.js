const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const League = require("../models/league");
const Stock = require("../models/stock");
const User = require("../models/user");
var jsonParser = bodyParser.json();

// used in create route
const stocks = require("../data/stocks");

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.post("/create", isLoggedIn, jsonParser, async (req, res) => {

  console.log(req.body);

  // basic data validation
  if (req.body.title === undefined ||
      req.body.title === "" ||
      typeof req.body.title !== "string" ||
      (req.body.visibility !== "public" && req.body.visibility !== "private") ||
      req.body.start === undefined ||
      req.body.start === "" ||
      typeof req.body.start !== "string" ||
      req.body.end === undefined ||
      req.body.end === "" ||
      typeof req.body.end !== "string" || 
      req.body.stocks.length === 0)
  {
    console.log("Possible errors in 'Title', 'League', 'Start', 'End', or 'Stocks length'.");
    res.send({ created: false });
    return;
  }

  try {
    const rightnow = new Date();
    const start = new Date(req.body.start);
    const end = new Date(req.body.end);
  } catch (e) {
    console.log(e);
    res.send({ created: false });
    return;
  }

  // before performing data validation on the stocks being input by the user we must fix the
  // issue where the front-end sends quantity attribute of a stock as type 'string' instead
  // of type 'number'. Note: this only happens when selecting a quantity greater than 1
  for (let i = 0; i < req.body.stocks.length; i++) {
    if (typeof req.body.stocks[i]["quantity"] !== "number") {
      // if the quantity is empty do not allow league creation
      if (req.body.stocks[i]["quantity"] === "" || req.body.stocks[i]["quantity"] === undefined){
        console.log("Stock quantity must have a value.");
        res.send({ created: false });
        return;
      }
      // else convert the string to int
      else{
        req.body.stocks[i]["quantity"] = parseInt(req.body.stocks[i]["quantity"]);
      }
    }
  }

  // get dates
  const rightnow = new Date();
  const start = new Date(req.body.start);
  const end = new Date(req.body.end);

  // date validation done here
  if (start <= rightnow || start >= end){
    console.log("Possible errors with selected 'Start' or 'End'.");
    res.send({ created: false });
    return;
  }
  // if dates are valid proceed to validate stock inputs
  else {
    // if the length of the stocks is over 1000 => not allowed
    if (req.body.stocks.length > 1000) {
      console.log("Total input 'Stocks' length is greater than 1000.");
      res.send({ created: false });
      return;
    }
    // now check the stocks input array (size can vary, need to check every possibility)
    for (let i = 0; i < req.body.stocks.length; i++) {
      if (typeof req.body.stocks[i]["stock"] !== "string" ||
          req.body.stocks[i]["stock"] === "" ||
          req.body.stocks[i]["stock"] === undefined ||
          typeof req.body.stocks[i]["quantity"] !== "number" ||
          req.body.stocks[i]["quantity"] > 10000 ||
          req.body.stocks[i]["quantity"] <= 0 ||
          (req.body.stocks[i]["position"] !== "long" && req.body.stocks[i]["position"] !== "short")) 
      {
        console.log("Possible errors in Stocks 'Ticker', 'Quantity', or 'Position'.");
        res.send({ created: false });
        return;
      }
    }
  }

  // lastly checking that all input stock tickers are actually in our ../data/stocks.js
  for (let i = 0; i < req.body.stocks.length; i++){
    let count = 0;
    for (let j = 0; j < stocks.length; j++) {
      if (req.body.stocks[i]["stock"] === stocks[j]["ticker"]) {
        count++;
      }
    }
    if (count === 0) {
      console.log("Your requested stock is not allowed.");
      res.send({ created: false });
      return;
    }
  }

  // no errors detected proceed to create league
  const leagueData = {
    host: req.user._id,
    title: req.body.title,
    players: [
      {
        player: req.user._id,
        stocks: await Promise.all(
          req.body.stocks.map(async (stockData) => {
            const price = await Stock.findOne({ ticker: stockData.stock });
            return {
              ticker: stockData.stock,
              quantity: stockData.quantity,
              position: stockData.position,
              priceAtTime: price.price,
            };
          })
        ),
      },
    ],
    visibility: req.body.visibility,
    commentsection: [],
    start: new Date(req.body.start),
    end: new Date(req.body.end),
  };

  const aThing = await (await League.create(leagueData)).save();

  const host = await User.findById({ _id: req.user._id });

  host.activeLeagues = [...host.activeLeagues, aThing._id];
  host.save();

  res.send({ created: true, leagueID: aThing._id });
});

router.patch("/join", jsonParser, async (req, res) => {

  // host represents the user instance from the MongoDB that is currently trying to join
  const host = await User.findById({ _id: req.user._id });
  // grabs data the activeLeagues of the user that is currently trying to join
  const activeLeagues = host.activeLeagues;
  // testing to see if user that is currently trying to join is already joined (hence can't join)
  const in_league = activeLeagues.includes(req.body.gameID);

  // can not join a league that has already passed
  const rightnow = new Date();
  //console.log(rightnow.toLocaleDateString());
  const game = await League.findById(req.body.gameID);
  //console.log(game.start);
  const game_year = game.start.getFullYear();
  const game_month = game.start.getMonth() + 1;
  const game_day = game.start.getDate() + 1;
  const game_full = [game_month, game_day, game_year].join("/");
  //console.log(game_full);
  if (rightnow.toLocaleDateString() >= game_full) {
    // current datetime must be less than the gamestart datetime in order to join a league
    console.log("Can not join a league that has already started.");
    res.send({ joined: false });
    return;
  }

  // before performing data validation on the stocks being input by the user we must fix the
  // issue where the front-end sends quantity attribute of a stock as type 'string' instead
  // of type 'number'. Note: this only happens when selecting a quantity greater than 1
  if (req.body.stocks.length !== 0) {
    for (let i = 0; i < req.body.stocks.length; i++) {
      if (typeof req.body.stocks[i]["quantity"] !== "number") {
        // if the quantity is empty do not allow league creation
        if (req.body.stocks[i]["quantity"] === "" || req.body.stocks[i]["quantity"] === undefined){
          console.log("Stock quantity must have a value.");
          res.send({ joined: false });
          return;
        }
        // else convert the string to int
        else{
          req.body.stocks[i]["quantity"] = parseInt(req.body.stocks[i]["quantity"]);
        }
      }
    }
  }

  // basic data validation
  if (req.body.gameID === undefined ||
      in_league ||
      req.body.stocks.length === 0) 
  {
    console.log("Possible errors with Stocks length or user already being in league or league not defined.");
    res.send({ joined: false });
    return;
  } 
  else {
    // if the length of the stocks is over 1000 => not allowed
    if (req.body.stocks.length > 1000) {
      console.log("Can not join due to amount of stocks over 1000.");
      res.send({ joined: false });
      return;
    }
    // now check the stocks input array (size can vary, need to check every possibility)
    for (let i = 0; i < req.body.stocks.length; i++) {
      if (typeof req.body.stocks[i]["stock"] !== "string" ||
          req.body.stocks[i]["stock"] === "" ||
          req.body.stocks[i]["stock"] === undefined ||
          typeof req.body.stocks[i]["quantity"] !== "number" ||
          req.body.stocks[i]["quantity"] > 10000 ||
          req.body.stocks[i]["quantity"] <= 0 ||
          (req.body.stocks[i]["position"] !== "long" && req.body.stocks[i]["position"] !== "short")) 
      {
        console.log("Possible errors in Stocks 'Ticker', 'Quantity', or 'Position'.");
        res.send({ joined: false });
        return;
      }
    }
  }

  // lastly checking that all input stock tickers are actually in our ../data/stocks.js
  for (let i = 0; i < req.body.stocks.length; i++){
    let count = 0;
    for (let j = 0; j < stocks.length; j++) {
      if (req.body.stocks[i]["stock"] === stocks[j]["ticker"]) {
        count++;
      }
    }
    if (count === 0) {
      console.log("Your requested stock is not allowed.");
      res.send({ joined: false });
      return;
    }
  }

  // if all data validation passed, then proceed to join the league
  const exists = League.exists({ _id: req.body.gameID });

  if (exists) {
    if (!in_league) {
      host.activeLeagues = [...host.activeLeagues, req.body.gameID];
      host.save();
    }
    const game = await League.findById(req.body.gameID);

    try {
      game.players.push({
        player: req.user._id,
        stocks: await Promise.all(
          req.body.stocks.map(async (stockData) => {
            const price = await Stock.findOne({ ticker: stockData.stock });
            return {
              ticker: stockData.stock,
              quantity: stockData.quantity,
              position: stockData.position,
              priceAtTime: price.price,
            };
          })
        ),
      });
    } catch (e) {
      console.log(e);
    }

    console.log("Joined league successfully");
    game.save();
    res.send({ joined: true });
  }
});

router.get("/search", jsonParser, async (req, res) => {
  if (
    req.query.page === undefined ||
    req.query.page < 1 ||
    req.query.search === undefined
  ) {
    res.send({ created: false });
    return;
  }

  // grabbing the current date
  const rightnow = new Date();

  const leagues = await League.find({
    $text: { $search: req.query.search }, // title: { $regex: req.query.search, $options: "i" }, // replace CSCI with user input
    visibility: "public",
    end: { $gte: rightnow },
  });

  leagues.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  res.send(leagues);
});

router.patch("/comment", isLoggedIn, jsonParser, async (req, res) => {

  // example of data being passed in: { gameID: '6362048f2b550520a6697db5', comment: 'hello' }
  //console.log(req.body);

  // grab the current league
  const league = await League.findById(req.body.gameID);
  // grab the current user
  const user = await User.findById(req.user._id);
  // check if the current user is in the league
  $in_league = false;
  for(let i = 0; i < league.players.length; i++){
    if(JSON.stringify(league.players[i].player) === JSON.stringify(user._id)){
      $in_league = true;
    }
  }
  if(!$in_league){
    console.log("You are not in the league so you can't comment.");
    res.send({ created: false });
    return;
  }

  // data validation
  if (req.body.gameID === undefined || // gameID must be defined
      req.body.comment === undefined || // comment must be defined
      typeof req.body.comment !== "string" || // comment must be of type string
      req.body.comment === "" || // comment must not be empty
      req.body.comment.length > 200) // comment chars must be less than or equal to 200
 {
    // comment can not be blank
    console.log("post comment failed");
    res.send({ created: false });
    return;
  }

  const commentData = {
    comment: req.body.comment,
    owner: req.user._id,
    likes: 0,
    dislikes: 0,
    replies: [],
  };

  const exists = League.exists({ _id: req.body.gameID });

  if (exists) {
    const game = await League.findById(req.body.gameID);

    // console.log(game);

    game.commentsection.push(commentData);
    game.save();
    res.send({ created: true });
    return;
  }
  res.send({ created: false });
});

router.patch("/comment/edit", jsonParser, async (req, res) => {
  /* DATA VALIDATION COMPLETE */

  // check to make sure data is valid
  if (
    req.body.gameID === undefined || // gameID must be defined
    req.body.commentID === undefined || // commentID must be defined
    typeof req.body.comment !== "string" || // comment must be of type string
    req.body.comment === "" || // comment edit must not be empty
    req.body.comment.length > 200 // comment chars must be less than or equal to 200
  ) {
    res.send({ created: false });
    return;
  }

  const exists1 = League.exists({ _id: req.body.gameID });

  if (exists1) {
    const game = await League.findById(req.body.gameID);
    const aComment = game.commentsection.map((comment) => {
      if (comment._id.toString() === req.body.commentID) {
        const aCopy = comment;
        aCopy.comment = req.body.comment;
        return aCopy;
      } else {
        return comment;
      }
    });
    game.commentsection = aComment;
    game.save();
  }
  res.send({ created: true });
});

router.patch("/comment/delete", isLoggedIn, jsonParser, async (req, res) => {
  /* DATA VALIDATION COMPLETE */

  // check gameID & commentID are defined (means user can only delete their own comment)
  if (req.body.gameID === undefined || req.body.commentID === undefined) {
    console.log(
      "Can not delete comment because gameID or commentID is undefined."
    );
    res.send({ created: false });
    return;
  }

  const exists1 = League.exists({ _id: req.body.gameID });

  if (exists1) {
    const game = await League.findById(req.body.gameID);
    const aComment = game.commentsection.filter((comment) => {
      return comment._id.toString() !== req.body.commentID;
    });
    game.commentsection = aComment;
    game.save();
    res.send({ created: true });
    return;
  }
  res.send({ created: false });
});

router.patch("/comment/reply", isLoggedIn, jsonParser, async (req, res) => {

  // grab the current league
  const league = await League.findById(req.body.gameID);
  // grab the current user
  const user = await User.findById(req.user._id);
  // check if the current user is in the league
  $in_league = false;
  for(let i = 0; i < league.players.length; i++){
    if(JSON.stringify(league.players[i].player) === JSON.stringify(user._id)){
      $in_league = true;
    }
  }
  if(!$in_league){
    console.log("You are not in the league so you can't reply.");
    res.send({ created: false });
    return;
  }

  // check to make sure data is valid
  if (
    req.body.gameID === undefined ||
    req.body.comment === undefined ||
    typeof req.body.comment !== "string" ||
    req.body.comment === "" ||
    req.body.comment.length > 200
  ) {
    console.log(
      "Can not reply to comment because gameID or comment is undefined or type of comment is not a string."
    );
    res.send({ created: false });
    return;
  }

  const commentData = {
    reply: req.body.comment,
    replyowner: req.user._id,
    likes: 0,
    dislikes: 0,
  };

  const exists = League.exists({ _id: req.body.gameID });

  if (exists) {
    const game = await League.findById(req.body.gameID);

    // console.log(game);

    game.commentsection.forEach(
      (ele) =>
        ele._id.toString() === req.body.commentID &&
        ele.replies.push(commentData)
    );

    // console.log(game);
    game.save();
    res.send({ created: true });
    return;
  }
  res.send({ created: false });
});

router.get("/:id", async (req, res) => {
  try {
    /* NO DATA VALIDATION REQUIRED */

    const exists = League.exists({ _id: req.params.id });

    if (exists) {
      const game = await League.findById(req.params.id);
      //console.log(game);

      const host = await User.findById({ _id: game.host });

      const players = await Promise.all(
        game.players.map(async (data) => {
          return {
            player: await User.findById(data.player),
            stocks: data.stocks,
          };
        })
      );

      const commentCollection = await Promise.all(
        game.commentsection.map(async (data) => {
          return {
            comment: data.comment,
            owner: await User.findById(data.owner),
            likes: data.likes,
            dislikes: data.dislikes,
            replies: await Promise.all(
              data.replies.map(async (ele) => {
                const replyUser = await User.findById(ele.replyowner);
                // console.log(replyUser);
                return {
                  reply: ele.reply,
                  replyowner: replyUser,
                  replylikes: ele.replylikes,
                  replydislikes: ele.replydislikes,
                  isOwner: ele.replyowner.toString() === req.user._id,
                };
              })
            ),
            isOwner: req.user._id === data.owner.toString(),
            commentID: data._id,
          };
        })
      );

      const userInLeague =
        game.players.filter((ele) => ele.player.toString() === req.user._id)
          .length === 1;

      const aGame = {
        title: game.title,
        host,
        visibility: game.visibility,
        start: game.start,
        end: game.end,
        players,
        commentsection: commentCollection,
        userInLeague,
      };

      // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      // console.log(aGame.commentsection);
      res.send({ ...aGame, success: true });
    }
  } catch (e) {
    console.log(e);
    res.send({ success: false });
  }
});

module.exports = router;
