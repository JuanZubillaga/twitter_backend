const checkJwt = require("express-jwt");

module.exports = {
  checkAuth: () => checkJwt({ secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ["HS256"] }),
};
