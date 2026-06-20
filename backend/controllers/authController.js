const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role: "user" });
    await user.save();
    res.status(201).json({ message: "Usuario registrado" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: user.role,
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({
      message: "Perfil actualizado",
      bio: user.bio,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfileWithAvatar = [
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.file) user.avatar = `/uploads/avatars/${req.file.filename}`;

      await user.save();
      res.json({
        message: "Perfil actualizado correctamente",
        bio: user.bio,
        avatar: user.avatar
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.updateRole = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.role = req.body.role;
    await user.save();

    res.json({ message: "Rol actualizado correctamente", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
