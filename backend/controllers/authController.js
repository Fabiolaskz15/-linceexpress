import transporter from "../config/mailer.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import db from "../config/db.js";

const BACKEND_URL =
    process.env.APP_URL ||
    "https://linceexpress-backend.onrender.com";

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "https://linceexpress.vercel.app";

export const registrar = async (req, res) => {

    try {

        const { nombre, correo, password } = req.body;

        if (!nombre || !correo || !password) {

            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });

        }

        const hash = await bcrypt.hash(password, 10);

        const token =
            crypto.randomBytes(32).toString("hex");

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
            async (error) => {

                if (error) {

                    console.error("❌ Error al registrar:", error);

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            mensaje: "Ese correo ya está registrado"
                        });
                    }

                    return res.status(500).json({
                        mensaje: "Error al registrar usuario"
                    });

                }

                const enlace =
                    `${BACKEND_URL}/api/auth/verificar/${token}`;

                try {

                    await transporter.sendMail({
                        from: `"LinceExpress" <${process.env.EMAIL_USER}>`,
                        to: correo,
                        subject: "🐾 Activa tu cuenta de LinceExpress",
                        html: `
                            <div style="
                                font-family: Arial, sans-serif;
                                background:#F8FAFC;
                                padding:25px;
                                color:#1E293B;
                            ">

                                <div style="
                                    max-width:600px;
                                    margin:auto;
                                    background:white;
                                    border-radius:16px;
                                    padding:25px;
                                    box-shadow:0 8px 20px rgba(0,0,0,.08);
                                ">

                                    <h1 style="color:#F97316;">
                                        🐾 LinceExpress
                                    </h1>

                                    <h2>
                                        Hola ${nombre}
                                    </h2>

                                    <p>
                                        Gracias por registrarte en LinceExpress.
                                    </p>

                                    <p>
                                        Haz clic en el siguiente botón para activar tu cuenta:
                                    </p>

                                    <a
                                        href="${enlace}"
                                        style="
                                        background:linear-gradient(135deg,#F97316,#8B5CF6);
                                        color:white;
                                        padding:14px 22px;
                                        text-decoration:none;
                                        border-radius:10px;
                                        display:inline-block;
                                        font-weight:bold;
                                        "
                                    >
                                        Activar Cuenta 🐾
                                    </a>

                                    <p style="margin-top:20px;">
                                        Si el botón no funciona, copia y pega este enlace:
                                    </p>

                                    <p style="word-break:break-all;">
                                        ${enlace}
                                    </p>

                                    <p>
                                        Si no solicitaste este registro, puedes ignorar este correo.
                                    </p>

                                </div>

                            </div>
                        `
                    });

                    console.log(
                        "📧 Correo de verificación enviado a:",
                        correo
                    );

                    return res.status(201).json({
                        mensaje: "Usuario registrado. Revisa tu correo."
                    });

                } catch (errorCorreo) {

                    console.error(
                        "❌ Error al enviar correo:",
                        errorCorreo
                    );

                    db.query(
                        `
                        DELETE FROM usuarios
                        WHERE correo = ?
                        `,
                        [correo]
                    );

                    return res.status(500).json({
                        mensaje: "No se pudo enviar el correo de verificación. Revisa EMAIL_PASS en Render."
                    });

                }

            }
        );

    } catch (error) {

        console.error("❌ Error interno:", error);

        return res.status(500).json({
            mensaje: "Error interno"
        });

    }

};

export const verificarCuenta = (req, res) => {

    const { token } = req.params;

    const sql = `
    UPDATE usuarios
    SET
        verificado = 1,
        token_verificacion = NULL
    WHERE token_verificacion = ?
    `;

    db.query(sql, [token], (error, resultado) => {

        if (error) {

            console.error("❌ Error al verificar:", error);

            return res.status(500).send(`
                <h2>Error al verificar la cuenta</h2>
            `);

        }

        if (resultado.affectedRows === 0) {

            return res.send(`
                <h2>Token inválido o expirado</h2>
                <p>Solicita un nuevo registro o inicia sesión si ya activaste tu cuenta.</p>
            `);

        }

        return res.send(`
            <div style="
                font-family:Arial,sans-serif;
                text-align:center;
                padding:40px;
            ">
                <h1>🐾 Cuenta activada correctamente</h1>

                <p>
                    Ya puedes iniciar sesión en LinceExpress.
                </p>

                <a
                    href="${FRONTEND_URL}/login.html"
                    style="
                    background:#F97316;
                    color:white;
                    padding:12px 20px;
                    border-radius:8px;
                    text-decoration:none;
                    font-weight:bold;
                    "
                >
                    Ir al login
                </a>
            </div>
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

            console.error("❌ Error login:", error);

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

    const token =
        crypto.randomBytes(32).toString("hex");

    const sql = `
    UPDATE usuarios
    SET token_recuperacion = ?
    WHERE correo = ?
    `;

    db.query(sql, [token, correo], async (error, resultado) => {

        if (error) {

            console.error("❌ Error recuperación:", error);

            return res.status(500).json({
                mensaje: "Error del servidor"
            });

        }

        if (resultado.affectedRows === 0) {

            return res.status(404).json({
                mensaje: "No existe una cuenta con ese correo"
            });

        }

        const enlace =
            `${BACKEND_URL}/api/auth/restablecer/${token}`;

        try {

            await transporter.sendMail({
                from: `"LinceExpress" <${process.env.EMAIL_USER}>`,
                to: correo,
                subject: "🔐 Recuperación de contraseña - LinceExpress",
                html: `
                    <div style="
                        font-family:Arial,sans-serif;
                        background:#F8FAFC;
                        padding:25px;
                    ">

                        <div style="
                            max-width:600px;
                            margin:auto;
                            background:white;
                            border-radius:16px;
                            padding:25px;
                        ">

                            <h1>🔐 Recuperación de contraseña</h1>

                            <p>
                                Haz clic en el siguiente botón para restablecer tu contraseña:
                            </p>

                            <a
                                href="${enlace}"
                                style="
                                background:linear-gradient(135deg,#F97316,#8B5CF6);
                                color:white;
                                padding:14px 22px;
                                border-radius:10px;
                                text-decoration:none;
                                font-weight:bold;
                                "
                            >
                                Restablecer Contraseña
                            </a>

                            <p style="margin-top:20px;">
                                Si el botón no funciona, copia y pega este enlace:
                            </p>

                            <p style="word-break:break-all;">
                                ${enlace}
                            </p>

                        </div>

                    </div>
                `
            });

            console.log(
                "📧 Correo de recuperación enviado a:",
                correo
            );

            return res.status(200).json({
                mensaje: "Correo de recuperación enviado"
            });

        } catch (errorCorreo) {

            console.error(
                "❌ Error al enviar recuperación:",
                errorCorreo
            );

            return res.status(500).json({
                mensaje: "No se pudo enviar el correo de recuperación"
            });

        }

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

            console.error("❌ Error restablecer:", error);

            return res.status(500).send("Error interno");

        }

        if (resultado.affectedRows === 0) {

            return res.send(`
                <h2>Token inválido</h2>
            `);

        }

        return res.send(`
            <div style="
                font-family:Arial,sans-serif;
                text-align:center;
                padding:40px;
            ">
                <h1>🔐 Contraseña restablecida</h1>

                <p>
                    Tu nueva contraseña temporal es:
                </p>

                <h2>Lince123!</h2>

                <p>
                    Inicia sesión con esta contraseña.
                </p>

                <a
                    href="${FRONTEND_URL}/login.html"
                    style="
                    background:#F97316;
                    color:white;
                    padding:12px 20px;
                    border-radius:8px;
                    text-decoration:none;
                    font-weight:bold;
                    "
                >
                    Ir al login
                </a>
            </div>
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

        if (error) {

            console.error("❌ Error perfil:", error);

            return res.status(500).json({
                mensaje: "Error del servidor"
            });

        }

        if (resultados.length === 0) {

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

            if (error) {

                console.error("❌ Error actualizar perfil:", error);

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