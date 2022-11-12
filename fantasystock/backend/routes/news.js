const express = require("express");
const router = express.Router();
require("dotenv").config();
const News = require("../models/news");

router.get("/", async (req, res) => {
  const aNews = await News.find({});
  res.send(aNews);
});

module.exports = router;
