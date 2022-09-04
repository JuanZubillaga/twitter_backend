const { User, Tweet } = require("../models");

module.exports = {
  store: async (req, res) => {
    const newTweet = new Tweet({
      content: req.body.tweet,
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
