const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const Post = require("../models/Post");

// Configuración de multer (subidas a carpeta uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // nombre único
  }
});
const upload = multer({ storage });

const {
  createPost,
  getPosts,
  likePost,
  deletePost
} = require("../controllers/postController");

// Crear post con imagen (FormData)
router.post("/", protect, upload.single("image"), createPost);

// Obtener posts con paginación
router.get("/", getPosts);

// Obtener detalle de un post por ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" }
      });

    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dar like a un post
router.post("/:id/like", protect, likePost);

// Eliminar post (solo autor o admin)
router.delete("/:id", protect, deletePost);

module.exports = router;
