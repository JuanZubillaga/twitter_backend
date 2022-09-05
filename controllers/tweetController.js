const { User, Tweet } = require("../models");

module.exports = {
  latestTweet: async (req, res) => {
    const latestTweet = await Tweet.find({ user: req.user.id })
      .populate({ path: "user", select: "username avatar" })
      .sort({ createdAt: "desc" })
      .limit(1);
    res.json({ latestTweet: latestTweet[0] });
  },
  store: async (req, res) => {
    const newTweet = new Tweet({
      content: req.body.content,
      user: req.user.id,
    });
    try {
      await newTweet.save();
    } catch {
      return res.json("missing fields");
    }
    await req.user.updateOne({ $push: { tweets: newTweet._id } });

    res.json("twitted!");
  },
  update: async (req, res) => {
    const wantedTweet = await Tweet.findById(req.params.id);
    const alreadyLiked = wantedTweet.likes.includes(req.user.id);
    if (alreadyLiked) {
      await wantedTweet.updateOne({ $pull: { likes: req.user.id } });
      return res.json({ liked: false });
    }
    await wantedTweet.updateOne({ $push: { likes: req.user.id } });
    res.json({ liked: true });
  },
  destroy: async (req, res) => {
    const ownTweet = req.user.tweets.includes(req.params.id);
    if (ownTweet) await Tweet.findByIdAndDelete(req.params.id);
    await req.user.updateOne({ $pull: { tweets: req.params.id } });
    res.json("deleted? only if it was yours...");
  },
};
