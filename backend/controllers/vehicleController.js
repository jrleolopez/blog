const Vehicle = require("../models/Vehicle");
const cloudinary = require("../config/cloudinary");

// Crear vehículo
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle({
      title: req.body.title,
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      price: req.body.price,
      mileage: req.body.mileage,
      city: req.body.city,
      description: req.body.description,
      whatsapp: req.body.whatsapp,
      image: req.file ? req.file.path : "",
      imageId: req.file ? req.file.filename : null,
      user: req.user.id
    });

    await vehicle.save();

    res.status(201).json({
      message: "Vehículo publicado correctamente",
      vehicle
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los vehículos
exports.getVehicles = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find()
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vehicle.countDocuments();

    res.json({
      vehicles,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un vehículo por ID
exports.getVehicleById = async (req, res) => {
  try {

    const vehicle = await Vehicle.findById(req.params.id)
      .populate("user", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username avatar"
        }
      });

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehículo no encontrado"
      });
    }

    vehicle.views += 1;
    await vehicle.save();

    res.json(vehicle);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar vehículo
exports.updateVehicle = async (req, res) => {
  try {

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehículo no encontrado"
      });
    }

    if (
      vehicle.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "No autorizado"
      });
    }

    if (req.body.title) vehicle.title = req.body.title;
    if (req.body.brand) vehicle.brand = req.body.brand;
    if (req.body.model) vehicle.model = req.body.model;
    if (req.body.year) vehicle.year = req.body.year;
    if (req.body.price) vehicle.price = req.body.price;
    if (req.body.mileage) vehicle.mileage = req.body.mileage;
    if (req.body.city) vehicle.city = req.body.city;
    if (req.body.description) vehicle.description = req.body.description;
    if (req.body.whatsapp) vehicle.whatsapp = req.body.whatsapp;
    if (req.body.status) vehicle.status = req.body.status;

    if (req.file) {

      if (vehicle.imageId) {
        await cloudinary.uploader.destroy(vehicle.imageId);
      }

      vehicle.image = req.file.path;
      vehicle.imageId = req.file.filename;
    }

    await vehicle.save();

    res.json({
      message: "Vehículo actualizado correctamente",
      vehicle
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar vehículo
exports.deleteVehicle = async (req, res) => {
  try {

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehículo no encontrado"
      });
    }

    if (
      vehicle.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "No autorizado"
      });
    }

    if (vehicle.imageId) {
      await cloudinary.uploader.destroy(vehicle.imageId);
    }

    await vehicle.deleteOne();

    res.json({
      message: "Vehículo eliminado correctamente"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};