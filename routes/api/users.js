const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const config = require("config");
const { validationResult, body } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//@route    POST api/users
//@desc     register new users
//@access   public
router.post(
  "/",
  [
    //name must be required
    body("name", "name is required.").not().isEmpty(),
    // username must be an email
    body("email", "please enter a valid email").isEmail(),
    // password must be at least 5 chars long
    body(
      "password",
      "please enter a password with 5 or more characters"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      //see if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user has already existed" }] });
      }
      //get user's gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new User({
        name,
        email,
        password,
        avatar,
      });
      //encrypt user password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      //return jsonwebtoken allowing logged in right away after registered
      const payload = {
        id: user.id,
      };
      jwt.sign(
        payload,
        config.get("jwtSecretToken"),
        {
          expiresIn: 3600000,
        },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).json("Server error");
    }
  }
);

module.exports = router;
