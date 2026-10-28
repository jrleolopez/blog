require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();
const path = require("path");


app.use(express.static(path.join(__dirname, "../frontend")));


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api", commentRoutes);

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

console.log("Cloudinary:", process.env.CLOUD_NAME);

