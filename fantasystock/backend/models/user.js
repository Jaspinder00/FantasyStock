const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const findorCreate = require("mongoose-findorcreate");

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
  friends: [this],
  currency: { type: Number, default: 0 },
});

UserSchema.plugin(findorCreate);

module.exports = mongoose.model("User", UserSchema);
