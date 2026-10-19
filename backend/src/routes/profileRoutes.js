const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} = require("../controllers/profileController");

router.route("/").get(getProfiles).post(upload, createProfile);
router.route("/:id").get(getProfileById).put(upload, updateProfile).delete(deleteProfile);

module.exports = router;
