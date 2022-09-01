const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

async function authController(req, res) {
  const user = await User.findOne({
    $or: [{ email: req.body.emailOrUsername }, { username: req.body.emailOrUsername }],
  });
  if (!user) return res.send("Credenciales erróneas");
  const passwordIsCorrect = await bcrypt.compare(req.body.password, user.password);
  if (!passwordIsCorrect) return res.send("Credenciales erróneas");
  const userData = { emailOrUsername: req.body.emailOrUsername, password: req.body.password };
  const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET);
  res.json({ token });
}

module.exports = authController;
