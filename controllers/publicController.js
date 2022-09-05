const { User } = require("../models");
// const { Tweet } = require("../models");
const formidable = require("formidable");
const bcrypt = require("bcryptjs");

// Store a newly created resource in storage.
async function store(req, res) {
  const form = formidable({
    multiples: true,
    uploadDir: __dirname + "/../public/img",
    keepExtensions: true,
  });
  form.parse(req, async (err, fields, files) => {
    const user = await User.findOne({
      $or: [{ email: fields.email }, { username: fields.username }],
    });
    if (!user) {
      const avatarField = files.avatar.originalFilename ? files.avatar.newFilename : "default.png";
      const newUser = new User({
        firstname: fields.firstname,
        lastname: fields.lastname,
        username: fields.username,
        email: fields.email,
        password: await bcrypt.hash(fields.password, 8),
        bio: fields.bio,
        avatar: "http://localhost:8000/img/" + avatarField,
      });
      try {
        await newUser.save();
      } catch {
        return res.json("missing fields");
      }
      return res.json("success");
    } else {
      res.json("credentials already in use");
    }
  });
}

module.exports = {
  store,
};
