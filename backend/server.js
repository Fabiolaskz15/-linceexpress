import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import db from "./config/db.js";
import authRoutes from "./routes/auth.js";

import productoRoutes from "./routes/productos.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/productos", productoRoutes);

app.get("/", (req, res) => {
    res.json({
        mensaje: "🐾 Bienvenido a la API de LinceExpress"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});