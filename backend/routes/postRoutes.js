const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts,
  likePost,
  deletePost
} = require("../controllers/postController");

router.post("/", protect, createPost);
router.get("/", getPosts);
router.post("/:id/like", protect, likePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
