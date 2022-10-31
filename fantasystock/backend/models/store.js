const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findorCreate = require("mongoose-findorcreate");

const StoreSchema = new Schema({
  item: {
    type: String,
    required: true,
  },
  image: {
    // holds the image filename so that it can then be displayed on the client-side
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sold: { type: Number, default: 0 },
});

StoreSchema.plugin(findorCreate);

module.exports = mongoose.model("Store", StoreSchema);
