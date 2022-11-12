const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findorCreate = require("mongoose-findorcreate");
const League = require("./league");

const UserSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  username: { type: String, default: "Cow1337killr" },
  displayName: { type: String, default: "" },
  familyName: { type: String, default: "" },
  givenName: { type: String, default: "" },
  photo: { type: String, default: "" },
  bio: { type: String, default: "Hello, World!" },
  friends: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  currency: { type: Number, default: 0 },
  activeLeagues: [{ type: mongoose.Types.ObjectId, ref: "League" }],
  passedLeagues: [{ type: mongoose.Types.ObjectId, ref: "League" }],
});

UserSchema.plugin(findorCreate);

module.exports = mongoose.model("User", UserSchema);
