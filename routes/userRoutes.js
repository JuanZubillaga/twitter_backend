const express = require("express");
const { expressjwt } = require("express-jwt");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const makeLoggedUserAvailable = require("../middlewares/makeLoggedUserAvailable");

userRouter.use(expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ["HS256"] }));
userRouter.use(makeLoggedUserAvailable);

// userRouter.get("/:id", userController.show);
userRouter.get("/recommended-users", userController.recommendedUsers);

userRouter.get("/home", userController.showHome);
userRouter.get("/profile/:username", userController.showProfile);
userRouter.patch("/follow/:username", userController.follow);
userRouter.patch("/unfollow/:username", userController.unfollow);
userRouter.patch("/:username", userController.updateProfile);
userRouter.get("/following/:username", userController.showFollowing);
userRouter.get("/followers/:username", userController.showFollowers);
userRouter.delete("/:id", userController.destroy);

module.exports = userRouter;
