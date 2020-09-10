const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");
const Profile = require("../models/Profile");
const User = require("../models/User");

//@route    GET api/profile/me
//@desc     get profile of current user
//@access   private
router.get("/me", auth, async (req, res) => {
  try {
    //get current profile
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(404).json("There is no profile for this user");
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json("Server Error");
  }
});
//@route    POST api/profile
//@desc     create or update profile of current user
//@access   private
router.post(
  "/",
  [
    auth,
    [
      body("status", "status is required. Please enter your status")
        .not()
        .isEmpty(),
      body("skills", "skills are required. Please enter your skills")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      github,
      youtube,
      twitter,
      facebook,
      instagram,
      linkedin,
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.status = status;
    profileFields.skills = skills.split(",").map((skill) => skill.trim());
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (github) profileFields.github = github;
    //build profile social
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = Profile.findOne({ user: req.user.id });
      if (profile) {
        //update current profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create new profile
      profile = new Profile({
        profileFields,
      });

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).json("Server Error");
    }
  }
);

module.exports = router;
