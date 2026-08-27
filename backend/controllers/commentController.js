const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Crear comentario
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body; // 👈 usar "content" en lugar de "text"
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });

    const comment = new Comment({
      content,
      user: req.user.id,
      post: post._id
    });

    await comment.save();
    post.comments.push(comment._id); // 👈 vincular al post
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener comentarios con paginación
exports.getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ post: req.params.postId });

    res.json({ comments, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dar like a un comentario
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comentario no encontrado" });

    comment.likes += 1;
    await comment.save();
    res.json({ message: "Like agregado", likes: comment.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar comentario
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comentario no encontrado" });

    if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    await comment.deleteOne();
    res.json({ message: "Comentario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
