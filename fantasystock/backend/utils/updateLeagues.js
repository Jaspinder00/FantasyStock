const League = require("../models/league");
const User = require("../models/user");
const Stock = require("../models/stock");
const user = require("../models/user");

module.exports = async () => {
  const right_now = new Date(); // const right_now = new Date("2022-11-24T22:04:11.597Z"); // grabs timestamp in UTC format
  //console.log(right_now); // outputs in UTC format
  //console.log("Date Time now: " + right_now.toLocaleString()); // outputs in our actual timezone (Date & Time provided)

  const updatable_leagues = await League.find({
    end: { $lte: right_now.toLocaleDateString() }, // comparison with local right_now (not the UTC right_now)
    active: true,
  });

  const all_stocks = await Stock.find({});

  updatable_leagues.forEach((league) => {
    const players_growth = league.players.map((player) => {
      const newPortfolio = player.stocks.reduce((prev, acc) => {
        const priceAtNow = all_stocks.find(
          (ele) => ele.ticker === acc.ticker
        ).price;

        const ans =
          acc.position === "long"
            ? (priceAtNow - acc.priceAtTime) * acc.quantity
            : acc.position === "short"
            ? (-priceAtNow + acc.priceAtTime) * acc.quantity
            : 0;

        return prev + ans;
      }, 0);

      const oldPortfolio = player.stocks.reduce((prev, acc) => {
        const ans =
          acc.position === "long"
            ? acc.priceAtTime * acc.quantity
            : acc.position === "short"
            ? -acc.priceAtTime * acc.quantity
            : 0;
        return prev + ans;
      }, 0);

      return {
        player: player.player,
        growth: newPortfolio / oldPortfolio,
      };
    });

    const sorted_leagues = players_growth.sort((a, b) => {
      if (a.growth < b.growth) {
        return 1;
      }
      if (a.growth > b.growth) {
        return -1;
      }
      return 0;
    });

    console.log(sorted_leagues);

    sorted_leagues.forEach(async (player, index) => {
      const aUser = await User.findById({ _id: player.player.toString() });
      aUser.currency += league.players.length * 1000 * (1 / (index + 1));
      aUser.activeLeagues = aUser.activeLeagues.filter(
        (league) => league.toString() === league._id
      );
      aUser.passedLeagues.push(league._id.toString());
      aUser.save();
    });

    league.active = false;
    league.save();
  });
};
