import express from "express";

import upload from "../config/multer.js";

import {
    crearProducto,
    obtenerProductos,
    actualizarProducto,
    eliminarProducto
} from "../controllers/productoController.js";

const router = express.Router();

router.post(
    "/",
    upload.single("imagen"),
    crearProducto
);

router.get(
    "/",
    obtenerProductos
);

router.put(
    "/:id",
    upload.single("imagen"),
    actualizarProducto
);

router.delete(
    "/:id",
    eliminarProducto
);

export default router;