const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createComment,
  getComments,
  likeComment,
  deleteComment
} = require("../controllers/commentController");

// Crear comentario en un post
router.post("/:postId/comments", protect, createComment);

// Obtener comentarios de un post con paginación
router.get("/:postId/comments", getComments);

// Dar like a un comentario
router.post("/comments/:id/like", protect, likeComment);

// Eliminar comentario (solo autor o admin)
router.delete("/comments/:id", protect, deleteComment);

module.exports = router;
