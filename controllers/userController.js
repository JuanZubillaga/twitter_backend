const { User, Tweet } = require("../models");
const formidable = require("formidable");

async function show(req, res) {
  if (req.params.id === req.user.id) return res.json(req.user);
  const wantedUser = await User.findById(
    req.params.id,
    "fullname username following followers avatar",
  );
  res.json(wantedUser);
}

async function recommendedUsers(req, res) {
  const loggedUser = req.user;
  const recommendedUsers = await User.find({
    $and: [{ id: { $nin: loggedUser.following } }, { id: { $ne: loggedUser.id } }],
  })
    .select("username avatar following followers")
    .limit(20);
  res.json(recommendedUsers);
}

async function showHome(req, res) {
  const loggedUser = req.user;
  const wantedTweets = await Tweet.find({ user: { $in: loggedUser.following } })
    .populate({ path: "user", select: "username avatar" })
    .sort({ createdAt: "desc" })
    .limit(20);
  const ownTweets = await Tweet.find({ user: loggedUser.id })
    .populate({ path: "user", select: "username avatar" })
    .sort({ createdAt: "desc" })
    .limit(5);

  const recommendedUsers = await User.find({
    $and: [{ _id: { $nin: loggedUser.following } }, { _id: { $ne: loggedUser._id } }],
  })
    .select("username avatar")
    .limit(20);

  res.json({ loggedUser, wantedTweets, recommendedUsers, ownTweets });
}

async function showProfile(req, res) {
  const wantedUser = await User.findById(req.params.id).select("-password");
  const wantedTweets = await Tweet.find({ user: wantedUser.id })
    .populate({ path: "user", select: "username avatar" })
    .sort({
      createdAt: "desc",
    })
    .limit(20);

  const loggedUser = req.user;
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

async function toggleFollow(req, res) {
  const wantedUser = await User.findById(req.params.id);
  const loggedUser = req.user;
  if (wantedUser.id === loggedUser.id) return res.json("incorrect action, cannot follow self");
  const alreadyFollowing = loggedUser.following.includes(wantedUser.id);
  if (alreadyFollowing) {
    await loggedUser.updateOne({ $pull: { following: wantedUser.id } });
    await wantedUser.updateOne({ $pull: { followers: loggedUser.id } });
  } else {
    await loggedUser.updateOne({ $push: { following: wantedUser.id } });
    await wantedUser.updateOne({ $push: { followers: loggedUser.id } });
  }
  res.json({ alreadyFollowing: !alreadyFollowing });
}

async function follow(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username });
  const loggedUser = req.user;
  const notFollowing = !loggedUser.following.includes(wantedUser.id);
  const notSelf = wantedUser.id !== loggedUser.id;
  if (notFollowing && notSelf) {
    await loggedUser.updateOne({ $push: { following: wantedUser.id } });
    await wantedUser.updateOne({ $push: { followers: loggedUser.id } });
  }
  res.json("following!");
}

async function unfollow(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username });
  const loggedUser = req.user;
  const alreadyFollowing = loggedUser.following.includes(wantedUser.id);
  const notSelf = wantedUser.id !== loggedUser.id;
  if (alreadyFollowing && notSelf) {
    await loggedUser.updateOne({ $pull: { following: wantedUser.id } });
    await wantedUser.updateOne({ $pull: { followers: loggedUser.id } });
  }
  res.json("unfollowed!");
}

async function updateProfile(req, res) {
  const loggedUser = req.user;
  const notSelf = req.params.username !== loggedUser.username;

  if (notSelf) {
    return res.json("unauthorized");
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
    await loggedUser.updateOne(update);
    res.json("updated");
  });
}

async function showFollowing(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username }).populate({
    path: "following",
  });
  const following = wantedUser.following;
  res.json(following);
}

async function showFollowers(req, res) {
  const wantedUser = await User.findOne({ username: req.params.username }).populate({
    path: "followers",
  });
  const followers = wantedUser.followers;
  res.json(followers);
}

async function destroy(req, res) {
  if (req.user.id !== req.params.id) return res.json("unauthorized");
  await Tweet.deleteMany({ user: req.params.id });
  await User.updateMany({}, { $pull: { following: req.params.id } });
  await User.updateMany({}, { $pull: { followers: req.params.id } });
  await User.findByIdAndDelete(req.params.id);
  res.json("deleted!");
}

module.exports = {
  show,
  recommendedUsers,
  showHome,
  showProfile,
  toggleFollow,
  follow,
  unfollow,
  updateProfile,
  showFollowing,
  showFollowers,
  destroy,
};
