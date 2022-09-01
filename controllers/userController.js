const { User, Tweet } = require("../models");
const formidable = require("formidable");
const { formatDistanceToNow } = require("date-fns");
const { es } = require("date-fns/locale");

async function showHome(req, res) {
  const loggedUser = req.auth;
  const wantedTweets = await Tweet.find({ user: { $in: loggedUser.following } })
    .populate({ path: "user", select: "username avatar" })
    .sort({ createdAt: "desc" })
    .limit(20);
  const ownTweets = await Tweet.find({ user: loggedUser.id }).sort({ createdAt: "desc" }).limit(5);
  for (const tweet of wantedTweets) {
    tweet.formattedDate = formatDistanceToNow(tweet.createdAt, { locale: es });
  }
  for (const tweet of ownTweets) {
    tweet.formattedDate = formatDistanceToNow(tweet.createdAt, { locale: es });
  }
  const recommendedUsers = await User.find({
    $and: [{ id: { $nin: loggedUser.following } }, { id: { $ne: loggedUser.id } }],
  })
    .select("username avatar")
    .limit(20);

  res.json({ loggedUser, wantedTweets, recommendedUsers, ownTweets });
}

async function showProfile(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username });
  const wantedTweets = await Tweet.find({ user: wantedUser.id })
    .sort({
      createdAt: "desc",
    })
    .limit(20);
  for (const tweet of wantedTweets) {
    tweet.formattedDate = formatDistanceToNow(tweet.createdAt, { locale: es });
  }
  const loggedUser = req.auth;
  const checkingOwnProfile = loggedUser.id === wantedUser.id;
  const alreadyFollowing = loggedUser.following.includes(wantedUser.id);
  const recommendedUsers = await User.find({
    $and: [{ id: { $nin: loggedUser.following } }, { id: { $ne: loggedUser.id } }],
  }).limit(20);
  res.json({
    wantedUser,
    checkingOwnProfile,
    alreadyFollowing,
    loggedUser,
    wantedTweets,
    recommendedUsers,
  });
}

async function follow(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username });
  const loggedUser = req.auth;
  const notFollowing = !loggedUser.following.includes(wantedUser.id);
  const notSelf = wantedUser.id !== loggedUser.id;
  if (notFollowing && notSelf) {
    await User.findByIdAndUpdate(loggedUser.id, { $push: { following: wantedUser.id } });
    await wantedUser.updateOne({ $push: { followers: loggedUser.id } });
  }
  res.json("following!");
}

async function unfollow(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username });
  const loggedUser = req.auth;
  const alreadyFollowing = loggedUser.following.includes(wantedUser.id);
  const notSelf = wantedUser.id !== loggedUser.id;
  if (alreadyFollowing && notSelf) {
    await loggedUser.updateOne({ $pull: { following: wantedUser.id } });
    await wantedUser.updateOne({ $pull: { followers: loggedUser.id } });
  }
  res.redirect("/home");
}

async function editProfileForm(req, res) {
  const loggedUser = req.user;
  const notSelf = req.params.username !== loggedUser.username;

  if (notSelf) {
    return res.redirect("/");
  }
  const wantedUser = await User.findOne({ username: req.params.username });

  res.render("editProfileForm", { wantedUser });
}

async function updateProfile(req, res) {
  const loggedUser = req.user;
  const notSelf = req.params.username !== loggedUser.username;

  if (notSelf) {
    return res.redirect("/");
  }

  const form = formidable({
    multiples: true,
    uploadDir: __dirname + "/../public/img",
    keepExtensions: true,
  });
  form.parse(req, async (err, fields, files) => {
    const update = files.avatar.newFilename
      ? {
          firstname: fields.firstname,
          lastname: fields.lastname,
          bio: fields.bio,
          avatar: files.avatar.newFilename,
        }
      : { firstname: fields.firstname, lastname: fields.lastname, bio: fields.bio };
    await req.user.updateOne(update);
    res.redirect(`/profile/${req.user.username}`);
  });
}

async function showFollowing(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username }).populate({
    path: "following",
  });
  const following = wantedUser.following;
  res.render("following_followers", { users: following, role: "following" });
}

async function showFollowers(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username }).populate({
    path: "followers",
  });
  const followers = wantedUser.followers;
  res.render("following_followers", { users: followers, role: "followers" });
}

async function destroy(req, res) {
  if (req.user.id !== req.params.id) return res.redirect("back");
  await Tweet.deleteMany({ user: req.params.id });
  await User.updateMany({}, { $pull: { following: req.params.id } });
  await User.updateMany({}, { $pull: { followers: req.params.id } });
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/logout");
}

function logout(req, res) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
}

function showPending(req, res) {
  res.render("pending");
}

module.exports = {
  showHome,
  showProfile,
  follow,
  unfollow,
  editProfileForm,
  updateProfile,
  showFollowing,
  showFollowers,
  destroy,
  logout,
  showPending,
};
