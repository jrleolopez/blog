const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  updateProfile, 
  updateRole, 
  getUsers, 
  deleteUser,
  getProfile, 
  updateProfileWithAvatar,
  verifyEmail
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

// Registro y login
router.post("/register", register);
router.post("/login", login);

// Perfil
router.get("/profile", protect, getProfile);
router.put("/profile", protect, ...updateProfileWithAvatar); // 👈 CORREGIDO

// Roles
router.put("/:id/role", protect, updateRole);

// Listar usuarios (solo admin)
router.get("/users", protect, getUsers);

// Eliminar usuario (solo admin)
router.delete("/:id", protect, deleteUser);

module.exports = router;
