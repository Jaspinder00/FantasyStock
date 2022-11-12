const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const League = require("../models/league");

var jsonParser = bodyParser.json();

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.post("/create", isLoggedIn, jsonParser, async (req, res) => {
  // ADD LEAGUE TO USERS ACTIVE LEAGUE
  // MAKE SURE START DATE IS AFTER CURRENT DAY
  // MAKE SURE END DATE IS AFTER THAT
  if (
    req.body.title === undefined ||
    req.body.stocks === undefined ||
    req.body.visibility === undefined ||
    req.body.start === undefined ||
    req.body.end === undefined
  )
    return;

  const leagueData = {
    host: req.user._id,
    title: req.body.title,
    players: [
      {
        player: req.user._id,
        stocks: req.body.stocks.map((stockData) => {
          return {
            ticker: stockData.stock,
            quantity: stockData.quantity,
            position: stockData.position,
          };
        }),
      },
    ],
    visibility: req.body.visibility,
    commentsection: [],
    start: new Date(req.body.start),
    end: new Date(req.body.end),
  };

  (await League.create(leagueData)).save();
});

router.patch("/join", jsonParser, async (req, res) => {
  // ADD LEAGUE TO USERS ACTIVE LIST
  // DONT LET USER JOIN IF ALREADY JOINED
  // MAKE SURE USER IS LOGGED IN
  // MAKE SURE START DATE IS AFTER CURRENT DATE
  if (req.body.gameID === undefined || req.body.stocks === undefined) return;

  const exists = League.exists({ _id: req.body.gameID });

  if (exists) {
    const game = await League.findById(req.body.gameID);

    game.players.push({
      player: req.user._id,
      stocks: req.body.stocks.map((stockData) => {
        return {
          ticker: stockData.stock,
          quantity: stockData.quantity,
          position: stockData.position,
        };
      }),
    });
    game.save();
  }
});

router.get("/search", jsonParser, async (req, res) => {
  if (req.query.page === undefined || req.query.page < 1) return;

  const leagues = await League.find({});

  leagues.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  const ans = leagues.slice((req.query.page - 1) * 25, req.query.page * 24);

  res.send(ans);
});

router.get("/:id", async (req, res) => {
  const exists = League.exists({ _id: req.params.id });

  if (exists) {
    const game = await League.findById(req.params.id);
    res.send(game);
  }
});

module.exports = router;
