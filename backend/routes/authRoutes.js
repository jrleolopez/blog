const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  updateProfile, 
  updateRole, 
  getUsers, 
  deleteUser   // 👈 aquí lo agregas
} = require("../controllers/authController");
const { getProfile, updateProfileWithAvatar } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

// Registro y login
router.post("/register", register);
router.post("/login", login);

// Perfil
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileWithAvatar);

// Roles
router.put("/:id/role", protect, updateRole);

// Listar usuarios (solo admin)
router.get("/users", protect, getUsers);

// Eliminar Usuario (solo admin)
router.delete("/:id", protect, deleteUser);

module.exports = router;
