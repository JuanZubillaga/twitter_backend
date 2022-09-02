const { User } = require("../models");

async function makeLoggedUserAvailable(req, res, next) {
  const loggedUser = await User.findById(req.auth.id);
  req.user = loggedUser;
  next();
}

module.exports = makeLoggedUserAvailable;
