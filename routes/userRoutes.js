const express = require("express");
const adminRouter = express.Router();
const { User, Tweet } = require("../models");
const checkAuthenticated = require("../middlewares/checkAuthenticated");
const userController = require("../controllers/userController");

adminRouter.get("/home", checkAuthenticated, userController.show);

adminRouter.get("/logout", checkAuthenticated, userController.logout);

adminRouter.get("/profile/:username", checkAuthenticated, async (req, res) => {
  const wantedUser = await User.findOne({ username: req.params.username }).populate({
    path: "tweets",
  });
  const checkingOwnProfile = req.user.id === wantedUser.id;
  res.render("profile", { wantedUser, checkingOwnProfile });
});

adminRouter.get("/follow/:username", checkAuthenticated, async (req, res) => {
  const wantedUser = await User.findOne({ username: req.params.username });
  const loggedUser = req.user;
  const notFollowing = !loggedUser.following.includes(wantedUser._id);
  const notSelf = !wantedUser._id.equals(loggedUser._id);
  if (notFollowing && notSelf) {
    await loggedUser.updateOne({ $push: { following: wantedUser._id } });
    await wantedUser.updateOne({ $push: { followers: loggedUser._id } });
  }
  res.redirect("/home");
});
adminRouter.get("/editar/:username", userController.editProfileForm);
adminRouter.post("/edit/:username", userController.storeProfile);
//faltacheckAuthenticated

adminRouter.get("/unfollow/:username", checkAuthenticated, async (req, res) => {
  const wantedUser = await User.findOne({ username: req.params.username });
  const loggedUser = req.user;
  const alreadyFollowing = loggedUser.following.includes(wantedUser._id);
  const notSelf = !wantedUser._id.equals(loggedUser._id);
  if (alreadyFollowing && notSelf) {
    await loggedUser.updateOne({ $pull: { following: wantedUser._id } });
    await wantedUser.updateOne({ $pull: { followers: loggedUser._id } });
  }
  res.redirect("/home");
});

module.exports = adminRouter;
