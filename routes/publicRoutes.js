const express = require("express");
const publicRouter = express.Router();
const authController = require("../controllers/authController");
const publicController = require("../controllers/publicController");

publicRouter.post("/login", authController);
publicRouter.post("/register", publicController.store);
publicRouter.get("/prueba", (req, res) => res.json("pruebaa"));

module.exports = publicRouter;
