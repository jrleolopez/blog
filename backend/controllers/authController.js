const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Importar configuración de Cloudinary
const { upload } = require("../config/cloudinary");

// Registro directo sin verificación por correo
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!regex.test(password)) {
      return res.status(400).json({ error: "La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ error: "El correo ya está registrado" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(409).json({ error: "El nombre de usuario ya está en uso" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashed,
      role: "user"
    });

    await user.save();
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Usuario o correo ya registrado" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET, { expiresIn: "1h" });

    res.json({ token, role: user.role, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener perfil
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar perfil con subida de avatar a Cloudinary
exports.updateProfileWithAvatar = [
  upload.single("avatar"),
  async (req, res) => {
    try {

      console.log("req.file:", req.file);
      console.log("req.body:", req.body);
      
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.file) user.avatar = req.file.path; 

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

// Actualizar rol de usuario (solo admin)
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

// Listar usuarios (solo admin)
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

// Eliminar usuario (solo admin)
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
