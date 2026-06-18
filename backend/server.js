require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
connectDB();

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));


// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/api/auth", authRoutes);       // Registro y login
app.use("/api/posts", postRoutes);      // CRUD de posts con likes y paginación
app.use("/api", commentRoutes);         // CRUD de comentarios anidados en posts
app.use("/uploads", express.static("uploads"));

// Conexión a la base de datos
connectDB();

// Puerto de ejecución
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
