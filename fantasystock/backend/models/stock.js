const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findorCreate = require("mongoose-findorcreate");

const StockSchema = new Schema(
  {
    ticker: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    sector: String,
    price: Number,
  },
  { timestamps: true }
);

StockSchema.plugin(findorCreate);

module.exports = mongoose.model("Stock", StockSchema);
