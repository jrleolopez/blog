const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");

exports.createPost = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      image: req.file ? req.file.path : "",
      imageId: req.file ? req.file.filename : null,
      user: req.user.id
    });

    await post.save();
    res.status(201).json({ message: "Post creado correctamente", post });
  } catch (error) {
    console.error("Error al crear post:", error);
    res.status(400).json({ error: error.message });
  }
};


// Obtener posts con paginación
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username");

    const total = await Post.countDocuments();

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dar like a un post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });

    post.likes += 1;
    await post.save();
    res.json({ message: "Like agregado", likes: post.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar post (con reemplazo de imagen en Cloudinary)
exports.updatePost = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err && err.message !== "Unexpected end of form") {
      return res.status(400).json({ error: err.message });
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post no encontrado" });

      if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "No autorizado" });
      }

      if (req.body.title) post.title = req.body.title;
      if (req.body.content) post.content = req.body.content;
      if (req.body.category) post.category = req.body.category;

      // Si hay nueva imagen, borrar la anterior en Cloudinary
      if (req.file) {
        if (post.imageId) {
          await cloudinary.uploader.destroy(post.imageId);
        }
        post.image = req.file.path;
        post.imageId = req.file.filename;
      }

      await post.save();
      res.json({ message: "Post actualizado correctamente", post });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Eliminar post y su imagen en Cloudinary
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });

    if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    if (post.imageId) {
      await cloudinary.uploader.destroy(post.imageId);
    }

    await post.deleteOne();
    res.json({ message: "Post eliminado y su imagen borrada de Cloudinary" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
