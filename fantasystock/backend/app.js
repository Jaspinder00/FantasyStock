if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const passport = require("passport");
const schedule = require("node-schedule");
const GetPrice = require("./routes/getPrice");
const userRoutes = require("./routes/users");
const createOrUpdateStocks = require("./utils/createOrUpdateStock");
const MongoDBStore = require("connect-mongo");

mongoose.connect(process.env.DB_HOST, {
  useNewURLParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connect error:"));
db.once("open", () => {
  console.log("Database connected");
});

const store = new MongoDBStore({
  mongoUrl: process.env.DB_HOST,
  secret: process.env.SESSION_SECERET,
  touchAfter: 24 * 60 * 60,
});

const sessionConfig = {
  secret: process.env.SESSION_SECERET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  store,
};

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

app.use("/register", userRoutes);
app.use("/getPrice", GetPrice);

app.get("/", (req, res) => res.send("Hi"));

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);

schedule.scheduleJob("0 */4 * * *", function () {
  createOrUpdateStocks();
});
