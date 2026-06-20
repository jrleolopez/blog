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
  updateProfileWithAvatar 
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileWithAvatar);

router.put("/:id/role", protect, updateRole);

router.get("/users", protect, getUsers);

router.delete("/:id", protect, deleteUser);

module.exports = router;
