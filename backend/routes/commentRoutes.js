const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createComment,
  getComments,
  likeComment,
  deleteComment
} = require("../controllers/commentController");

router.post("/:postId/comments", protect, createComment);
router.get("/:postId/comments", getComments);
router.post("/comments/:id/like", protect, likeComment);
router.delete("/comments/:id", protect, deleteComment);

module.exports = router;
