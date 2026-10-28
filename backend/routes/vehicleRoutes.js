const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const Vehicle = require("../models/Vehicle");
const { upload } = require("../config/cloudinary");

const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} = require("../controllers/vehicleController");

// Crear vehículo
router.post(
  "/",
  protect,
  (req, res, next) => {
    upload.single("image")(req, res, function (err) {
      if (err && err.message !== "Unexpected end of form") {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  createVehicle
);

// Listar vehículos
router.get("/", getVehicles);

// Obtener detalle vehículo
router.get("/:id", getVehicleById);

// Actualizar vehículo
router.put(
  "/:id",
  protect,
  (req, res, next) => {
    upload.single("image")(req, res, function (err) {
      if (err && err.message !== "Unexpected end of form") {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  updateVehicle
);

// Eliminar vehículo
router.delete("/:id", protect, deleteVehicle);

module.exports = router;