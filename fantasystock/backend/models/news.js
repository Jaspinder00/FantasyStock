const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findorCreate = require("mongoose-findorcreate");

const NewsSchema = new Schema(
  {
    source: { id: String, name: String },
    author: String,
    title: String,
    description: String,
    url: String,
    urlToImage: String,
    publishedAt: Date,
    content: String,
  },
  { timestamps: true }
);

NewsSchema.plugin(findorCreate);

module.exports = mongoose.model("News", NewsSchema);
