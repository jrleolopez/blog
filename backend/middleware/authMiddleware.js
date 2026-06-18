const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "No autorizado, token faltante" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Buscar usuario en la BD y adjuntar al request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    req.user = user; // ahora tienes { _id, username, role, bio, avatar }
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = protect;
