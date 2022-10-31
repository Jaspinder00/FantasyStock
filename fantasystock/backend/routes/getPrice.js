const express = require("express");
const router = express.Router();
var request = require("request");

require("dotenv").config();
const Stocks = require("../models/stock");

router.get("/", async (req, res) => {
  const aStocks = await Stocks.find({});
  res.send(aStocks);
});

module.exports = router;
