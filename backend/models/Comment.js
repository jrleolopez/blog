const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true }, // 👈 usar "content" en lugar de "text"
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true }, // 👈 usar "post" en lugar de "postId"
  likes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);

