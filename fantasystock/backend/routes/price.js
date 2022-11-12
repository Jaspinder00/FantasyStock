const express = require("express");
const router = express.Router();
var request = require("request");

require("dotenv").config();
const Stocks = require("../models/stock");

router.get("/tickers", async (req, res) => {
  const aStocks = await Stocks.find({});
  res.send(aStocks.map((aStock) => aStock.ticker));
});

router.get("/", async (req, res) => {
  const aStocks = await Stocks.find({});
  res.send(aStocks);
});

module.exports = router;
