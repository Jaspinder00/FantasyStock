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
    players: {
      type: [
        {
          player: { type: Schema.Types.ObjectId, ref: "User", unqiue: true },
          stocks: [{ type: Schema.Types.ObjectId, ref: "Stock" }],
        },
      ],
    },
    public: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LeagueSchema.plugin(findorCreate);

module.exports = mongoose.model("Comment", LeagueSchema);
