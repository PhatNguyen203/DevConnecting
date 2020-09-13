const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");

//@route    POST api/posts
//@desc     create a new of current user
//@access   private
router.post(
  "/",
  [auth, [body("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById({ _id: req.user.id }).select(
        "-password"
      );
      console.log(user);
      const newPost = new Post({
        text: req.body.text,
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
      });
      const post = await newPost.save();
      return res.json(post);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json("Server Error");
    }
  }
);

module.exports = router;
