const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Tweet } = require("../models");

async function authController(req, res) {
  const user = await User.findOne({
    $or: [{ email: req.body.emailOrUsername }, { username: req.body.emailOrUsername }],
  });
  if (!user) return res.send("Credenciales erróneas");
  const passwordIsCorrect = await bcrypt.compare(req.body.password, user.password);
  if (!passwordIsCorrect) return res.send("Credenciales erróneas");

  const wantedTweets = await Tweet.find({ user: { $in: user.following } })
    .populate({ path: "user", select: "username avatar" })
    .sort({ createdAt: "desc" })
    .limit(20);

  const ownTweets = await Tweet.find({ user: user.id })
    .populate({ path: "user", select: "username avatar" })
    .sort({ createdAt: "desc" });

  const recommendedUsers = await User.find({
    $and: [{ _id: { $nin: user.following } }, { _id: { $ne: user._id } }],
  })
    .select("username avatar")
    .limit(20);

  const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
  res.json({ token, user, wantedTweets, ownTweets, recommendedUsers });
}

module.exports = authController;
