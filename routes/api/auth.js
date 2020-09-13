const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const { validationResult, body } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/auth
// @desc     login user
// @access   Private
router.post(
  "/",
  [
    body("email", "email is required. Please enter your valid email").isEmail(),
    body(
      "password",
      "password is required. Please enter your password"
    ).exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: "invalid credentials" });
      }
      const isMatched = await bcrypt.compare(password, user.password);
      if (!isMatched) {
        return res.status(400).json({ msg: "password is incorrect" });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecretToken"),
        {
          expiresIn: 3600000,
        },
        (error, token) => {
          if (error) throw error;
          res.json(token);
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).json("Server Error");
    }
  }
);

module.exports = router;
