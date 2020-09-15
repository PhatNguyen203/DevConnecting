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

//@route    GET api/posts
//@desc     get all posts
//@access   private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});

//@route    GET api/posts/:post_id
//@desc     get a post by post Id
//@access   private
router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: "no post found" });
    }
    return res.json(post);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "no user found" });
    }
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});
//@route    DELETE api/posts/:user_id
//@desc     delete post by post id
//@access   private
router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.user.id);
    if (post.user.id.toString() !== req.user.id) {
      return res.status(400).json({ msg: "user not authorized" });
    }
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    //remove post
    await post.remove();
    return res.send("post removed");
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "no user found" });
    }
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});
module.exports = router;
