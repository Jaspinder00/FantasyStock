require("dotenv").config();
var request = require("request");
const Stock = require("../models/stock");
require("dotenv").config();
const batchMap = require("./batchmap");
const asyncFilter = require("./asyncFilter");
const stocks = require("../data/stocks");

const createOrUpdateStock = (stock) => {
  request(
    `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock.ticker}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_KEY}`,
    async (error, response, body) => {
      if (!error && response.statusCode == 200) {
        try {
          setTimeout(async () => {
            const parsedBody = JSON.parse(body);
            const aTime = parsedBody["Meta Data"]["3. Last Refreshed"];
            const aPrice = parsedBody["Time Series (5min)"][aTime]["4. close"];
            await Stock.findOrCreate(
              { ticker: stock.ticker },
              {
                ticker: stock.ticker,
                name: stock.name,
                sector: stock.sector,
                price: aPrice,
              }
            )
              .then(async (res) => {
                await Stock.findByIdAndUpdate(res.doc._id, {
                  price: aPrice,
                });
              })
              .catch((error) => console.log(`Mongo Error: ${error}`));
          }, 1000 * 72);
        } catch (error) {
          console.log(error);
        }
      }
    }
  );
};

module.exports = () => {
  asyncFilter(stocks, async (ele) => {
    try {
      const [aStock] = await Stock.find({ ticker: ele.ticker });
      if (aStock === undefined) {
        return true;
      } else {
        const date = new Date(aStock.updatedAt);
        date.setHours(date.getHours() + 24);
        return date < new Date();
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }).then((res) => {
    console.log(`UPDATING LIST: ${res.map((e) => e.ticker)}`);
    console.log(`LENGTH: ${res.length}`);
    batchMap(res, createOrUpdateStock);
  });
};
