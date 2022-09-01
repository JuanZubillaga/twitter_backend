const express = require("express");
const publicRouter = express.Router();
const authController = require("../controllers/authController");
const publicController = require("../controllers/publicController");

publicRouter.get("/", publicController.welcome);
publicRouter.get("/login", publicController.showLogin);
publicRouter.post("/login", authController);
publicRouter.get("/registro", publicController.create);
publicRouter.post("/register", publicController.store);
publicRouter.get("/test", publicController.test);

module.exports = publicRouter;
