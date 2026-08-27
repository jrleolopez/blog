const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, default: "General" }, // nueva categoría
  image: { type: String, default: "img/default-post.jpg" }, // imagen por defecto
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // usuarios que dieron like
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // usuarios que guardaron
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }] // relación con comentarios
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);

