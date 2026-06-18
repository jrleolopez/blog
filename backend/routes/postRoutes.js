const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts,
  likePost,
  deletePost
} = require("../controllers/postController");

// Crear post (requiere login)
router.post("/", protect, createPost);

// Obtener posts con paginación
router.get("/", getPosts);

// Dar like a un post
router.post("/:id/like", protect, likePost);

// Eliminar post (solo autor o admin)
router.delete("/:id", protect, deletePost);

module.exports = router;
