const Comment = require("../models/Comment");

// Crear comentario
exports.createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = new Comment({
      text,
      user: req.user.id,
      postId: req.params.postId
    });
    await comment.save();
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

    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ postId: req.params.postId });

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
