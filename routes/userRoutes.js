const express = require("express");
const { expressjwt } = require("express-jwt");
const adminRouter = express.Router();
const userController = require("../controllers/userController");
const makeLoggedUserAvailable = require("../middlewares/makeLoggedUserAvailable");

adminRouter.use(expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ["HS256"] }));
adminRouter.use(makeLoggedUserAvailable);

adminRouter.get("/home", userController.showHome);
adminRouter.get("/:username", userController.showProfile);

adminRouter.patch("/follow/:username", userController.follow);
adminRouter.patch("/unfollow/:username", userController.unfollow);
adminRouter.patch("/:username", userController.updateProfile);
adminRouter.get("/following/:username", userController.showFollowing);
adminRouter.get("/followers/:username", userController.showFollowers);
adminRouter.delete("/:id", userController.destroy);

module.exports = adminRouter;
