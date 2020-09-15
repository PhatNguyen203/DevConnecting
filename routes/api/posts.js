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
      return res.status(400).json({ msg: "no post found" });
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
    const post = await Post.findById(req.params.post_id);
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
      return res.status(400).json({ msg: "no post found" });
    }
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});

//@route    PUT api/posts/like/:post_id
//@desc     like the post
//@access   private
router.put("/like/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //check whether the post is liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    //likes the post
    post.likes.push({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "no post found" });
    }
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});

//@route    PUT api/posts/unlike/:post_id
//@desc     unlike the post
//@access   private
router.put("/unlike/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    //check whether the post is liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    //remove the like
    const removeIndex = await Post.likes
      .map((like) => like.user.id.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "no post found" });
    }
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});

//@route    POST api/posts/comment/:post_id
//@desc     comment on a post
//@access   private
router.post(
  "/comment/:post_id",
  [auth[body("text", "comment is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.post_id);

      const newComment = {
        text: req.body.text,
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
      };
      post.comments.push(newComment);
      await post.save();
      return res.json(post);
    } catch (error) {
      if (error.kind == "ObjectId") {
        return res.status(400).json({ msg: "no post found" });
      }
      console.log(error.message);
      return res.status(500).json("Server Error");
    }
  }
);

//@route    DELETE api/posts/comment/:post_id
//@desc     Delete a comment on a post
//@access   private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    const comment = await post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    //check comment exists and authorizes or not
    if (!comment) {
      return res.status(404).json({ msg: "comment does not exists" });
    }
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }
    //remove a comment
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    return res.json(post.comments);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "no post found" });
    }
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});
module.exports = router;
