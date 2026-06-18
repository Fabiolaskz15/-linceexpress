import express from "express";

import {
    registrar,
    verificarCuenta,
    login,
    solicitarRecuperacion,
    restablecerPassword,
    obtenerPerfil,
    actualizarPerfil
} from "../controllers/authController.js";

const router = express.Router();

router.post("/registro", registrar);

router.get("/verificar/:token", verificarCuenta);

router.post("/login", login);

router.post(
    "/recuperar",
    solicitarRecuperacion
);

router.get(
    "/restablecer/:token",
    restablecerPassword
);

router.get(
    "/perfil/:id",
    obtenerPerfil
);

router.put(
    "/perfil/:id",
    actualizarPerfil
);

export default router;