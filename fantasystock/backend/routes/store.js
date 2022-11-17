const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Inventory = require("../data/inventory.js");
const bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
require("dotenv").config();

router.patch("/buy", jsonParser, async (req, res) => {
  // host is the current user
  const host = await User.findById({ _id: req.user._id });
  // if req.body.item is in inventory.js, itemThing will be equal to ex: { name: 'amazon', price: 1000 }, else undefined
  const itemThing = Inventory.find((ele) => ele.name === req.body.item);
  // if req.body.item is in inventory.js, owns will be true, else false
  const owns = Inventory.some((item) => item.name === req.body.item);

  //console.log(host);
  //console.log(itemThing.name);
  //console.log(host.icons.includes(itemThing.name));

  // data validation on example: { item: 'amazon' }
  if (
    req.body.item === undefined || // item name trying to be bought is undefined
    typeof req.body.item !== "string" || // item name trying to be bought is not type string
    itemThing.name === undefined || // item name is not in the inventory (item does not exist)
    host.currency < itemThing.price || // user balance is less than item price
    !owns || // item is not in the inventory.js
    host.icons.includes(itemThing.name)
  ) {
    // user already owns the item
    console.log("Could not buy item");
    res.send({ created: false });
    return;
  }

  // passed all error checks, so user can successfully buy item
  console.log("Sufficient Funds");
  host.currency = host.currency - itemThing.price;
  host.icons.push(itemThing.name);
  host.save();
});

router.get("/", async (req, res) => {
  res.send(Inventory);
});

module.exports = router;
