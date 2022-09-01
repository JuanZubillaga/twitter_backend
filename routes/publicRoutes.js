const express = require("express");
const publicRouter = express.Router();
const authController = require("../controllers/authController");
const publicController = require("../controllers/publicController");

publicRouter.post("/login", authController);
publicRouter.get("/registro", publicController.create);
publicRouter.post("/register", publicController.store);

module.exports = publicRouter;
