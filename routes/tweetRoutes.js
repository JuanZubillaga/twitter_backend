const express = require("express");
const { expressjwt } = require("express-jwt");
const tweetRouter = express.Router();
const tweetController = require("../controllers/tweetController");
const makeLoggedUserAvailable = require("../middlewares/makeLoggedUserAvailable");

tweetRouter.use(expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ["HS256"] }));
tweetRouter.use(makeLoggedUserAvailable);

tweetRouter.get("/latest-tweet", tweetController.latestTweet);
tweetRouter.post("/", tweetController.store);
tweetRouter.patch("/:id", tweetController.update);
tweetRouter.delete("/:id", tweetController.destroy);

module.exports = tweetRouter;
