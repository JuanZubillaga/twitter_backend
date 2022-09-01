const express = require("express");
const { expressjwt } = require("express-jwt");
const tweetRouter = express.Router();
const tweetController = require("../controllers/tweetController");

tweetRouter.use(expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ["HS256"] }));

tweetRouter.post("/tweet", tweetController.store);
tweetRouter.patch("/tweet/:id", tweetController.update);
tweetRouter.delete("/tweet/:id", tweetController.destroy);

module.exports = tweetRouter;
