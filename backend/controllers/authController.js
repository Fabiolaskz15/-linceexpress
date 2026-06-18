import transporter from "../config/mailer.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import db from "../config/db.js";

export const registrar = async (req, res) => {

    try {

        const { nombre, correo, password } = req.body;

        if (!nombre || !correo || !password) {

            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });

        }

        const hash = await bcrypt.hash(password, 10);

        const token = crypto.randomBytes(32).toString("hex");

        const sql = `
        INSERT INTO usuarios
        (
            nombre,
            correo,
            password,
            token_verificacion
        )
        VALUES
        (
            ?, ?, ?, ?
        )
        `;

        db.query(
            sql,
            [
                nombre,
                correo,
                hash,
                token
            ],
            (error, resultado) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        mensaje: "Error al registrar usuario"
                    });

                }

                const enlace = `${process.env.APP_URL}/api/auth/verificar/${token}`;

                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: correo,
                    subject: "🐾 Activa tu cuenta de LinceExpress",
                    html: `
                        <h2>Hola ${nombre}</h2>

                        <p>Gracias por registrarte en LinceExpress.</p>

                        <p>Haz clic en el siguiente botón para activar tu cuenta:</p>

                        <a href="${enlace}"
                           style="
                           background:#E67E22;
                           color:white;
                           padding:12px 20px;
                           text-decoration:none;
                           border-radius:8px;
                           display:inline-block;
                           ">
                            Activar Cuenta 🐾
                        </a>

                        <p>Si no solicitaste este registro puedes ignorar este correo.</p>
                    `
                });

                return res.status(201).json({
                    mensaje: "Usuario registrado. Revisa tu correo."
                });

            }
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            mensaje: "Error interno"
        });

    }

};

export const verificarCuenta = (req, res) => {

    const { token } = req.params;

    const sql = `
    UPDATE usuarios
    SET verificado = 1
    WHERE token_verificacion = ?
    `;

    db.query(sql, [token], (error, resultado) => {

        if (error) {

            console.error(error);

            return res.status(500).send("Error al verificar");

        }

        if (resultado.affectedRows === 0) {

            return res.send(`
                <h2>Token inválido o expirado</h2>
            `);

        }

        return res.send(`
            <h1>🐾 Cuenta activada correctamente</h1>
            <p>Ya puedes iniciar sesión en LinceExpress.</p>
        `);

    });

};

export const login = (req, res) => {

    const { correo, password } = req.body;

    if (!correo || !password) {

        return res.status(400).json({
            mensaje: "Correo y contraseña son obligatorios"
        });

    }

    const sql = `
    SELECT *
    FROM usuarios
    WHERE correo = ?
    `;

    db.query(sql, [correo], async (error, resultados) => {

        if (error) {

            console.error(error);

            return res.status(500).json({
                mensaje: "Error del servidor"
            });

        }

        if (resultados.length === 0) {

            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos"
            });

        }

        const usuario = resultados[0];

        if (!usuario.verificado) {

            return res.status(403).json({
                mensaje: "Debes verificar tu correo antes de iniciar sesión"
            });

        }

        const coincide = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!coincide) {

            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos"
            });

        }

        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });

    });

};

export const solicitarRecuperacion = (req, res) => {

    const { correo } = req.body;

    if (!correo) {

        return res.status(400).json({
            mensaje: "Debes ingresar un correo"
        });

    }

    const token = crypto.randomBytes(32).toString("hex");

    const sql = `
    UPDATE usuarios
    SET token_recuperacion = ?
    WHERE correo = ?
    `;

    db.query(sql, [token, correo], async (error, resultado) => {

        if (error) {

            console.error(error);

            return res.status(500).json({
                mensaje: "Error del servidor"
            });

        }

        const enlace = `${process.env.APP_URL}/api/auth/restablecer/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: correo,
            subject: "🔐 Recuperación de contraseña - LinceExpress",
            html: `
                <h2>Recuperación de contraseña</h2>

                <p>Haz clic en el siguiente botón para cambiar tu contraseña:</p>

                <a href="${enlace}"
                   style="
                   background:#E67E22;
                   color:white;
                   padding:12px 20px;
                   border-radius:8px;
                   text-decoration:none;
                   ">
                    Restablecer Contraseña
                </a>
            `
        });

        return res.status(200).json({
            mensaje: "Correo de recuperación enviado"
        });

    });

};

export const restablecerPassword = async (req, res) => {

    const { token } = req.params;

    const nuevaPassword = "Lince123!";

    const hash = await bcrypt.hash(nuevaPassword, 10);

    const sql = `
    UPDATE usuarios
    SET
        password = ?,
        token_recuperacion = NULL
    WHERE token_recuperacion = ?
    `;

    db.query(sql, [hash, token], (error, resultado) => {

        if (error) {

            console.error(error);

            return res.status(500).send("Error interno");

        }

        if (resultado.affectedRows === 0) {

            return res.send(`
                <h2>Token inválido</h2>
            `);

        }

        return res.send(`
            <h1>🔐 Contraseña restablecida</h1>

            <p>
                Tu nueva contraseña temporal es:
            </p>

            <h2>Lince123!</h2>

            <p>
                Inicia sesión y cámbiala después.
            </p>
        `);

    });

};

export const obtenerPerfil = (req, res) => {

    const { id } = req.params;

    const sql = `
    SELECT
        id,
        nombre,
        correo,
        telefono,
        carrera,
        descripcion
    FROM usuarios
    WHERE id = ?
    `;

    db.query(sql, [id], (error, resultados) => {

        if(error){

            return res.status(500).json({
                mensaje: "Error del servidor"
            });

        }

        if(resultados.length === 0){

            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });

        }

        return res.json(resultados[0]);

    });

};

export const actualizarPerfil = (req, res) => {

    const { id } = req.params;

    const {
        telefono,
        carrera,
        descripcion
    } = req.body;

    const sql = `
    UPDATE usuarios
    SET
        telefono = ?,
        carrera = ?,
        descripcion = ?
    WHERE id = ?
    `;

    db.query(
        sql,
        [
            telefono,
            carrera,
            descripcion,
            id
        ],
        (error) => {

            if(error){

                return res.status(500).json({
                    mensaje: "Error al actualizar perfil"
                });

            }

            return res.json({
                mensaje: "Perfil actualizado correctamente"
            });

        }
    );

};