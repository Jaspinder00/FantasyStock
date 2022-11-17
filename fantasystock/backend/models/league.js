const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findorCreate = require("mongoose-findorcreate");
const User = require("./user");
const Stock = require("./stock");

const LeagueSchema = new Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    players: [
      {
        type: {
          player: { type: Schema.Types.ObjectId, ref: "User" },
          stocks: [
            {
              ticker: { type: String },
              quantity: { type: Number },
              position: {
                type: String,
                enum: ["long", "short"],
                default: "long",
              },
              priceAtTime: { type: Number, default: 0 },
            },
          ],
        },
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    active: { type: Boolean, default: true },
    commentsection: [
      {
        comment: {
          type: String,
        },
        owner: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        replies: [
          {
            reply: {
              type: String,
            },
            replyowner: {
              type: Schema.Types.ObjectId,
              ref: "User",
            },
            replylikes: { type: Number, default: 0 },
            replydislikes: { type: Number, default: 0 },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

LeagueSchema.plugin(findorCreate);

module.exports = mongoose.model("League", LeagueSchema);
