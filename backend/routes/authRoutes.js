
const express = require("express");

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const router = express.Router();

// Customer registration
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

module.exports = router;
